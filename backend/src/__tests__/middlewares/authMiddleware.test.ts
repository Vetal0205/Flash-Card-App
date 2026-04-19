/**
 * Tests for authMiddleware — Bearer JWT authentication
 *
 * These are specification (TDD) tests: they define the expected contract
 * for the authenticate middleware. They will fail with "Not implemented" until
 * the middleware is fully implemented, at which point all should pass.
 *
 * Author: Vitalii Belsiubniak
 *
 * Middleware contract (FR-30, NFR-07/08):
 * 1. Extract Bearer token from Authorization header
 * 2. jwt.verify(token, secret) — verify token signature and expiry
 * 3. UserService.findById(payload.id) — confirm user still exists
 *    and is not locked (FR-30: lockoutUntil > now)
 * 4. Attach user data to req.userdata; call next()
 *
 * TC-AUTH-MW-F-007 (deleted user) and TC-AUTH-MW-F-008 (locked account) both
 * cover FR-30: a token may be structurally valid but the user's DB state can
 * render it invalid — the middleware must re-check on every request.
 *
 * TC-AUTH-MW-NF-002 (rate limiting) is an integration/E2E concern enforced by
 * express-rate-limit before the middleware runs — marked todo.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mocks must appear before the module under test is imported.
// jwt.verify is mocked to avoid real crypto work and to control
// success / error scenarios without needing a real secret.
jest.mock('jsonwebtoken');

// UserService is mocked to isolate the middleware from the database.
// Only findById is used by the middleware per the spec above.
jest.mock('../../api/services/UserService', () => ({
    __esModule: true,
    default: {
        findById: jest.fn(),
    },
}));

import AuthMiddleware from '../../api/middlewares/AuthMiddleware';
import userService from '../../api/services/UserService';
import { UnauthorizedError } from '../../errors';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Minimal mock of Express Request.
 * authHeader is placed into req.headers.authorization exactly as a
 * real browser would send it: "Bearer <token>".
 */
function makeReq(authHeader?: string): Partial<Request> {
    return {
        headers: authHeader ? { authorization: authHeader } : {},
    };
}

function makeRes(): Partial<Response> {
    return {};
}

/** Returns a fresh jest.fn() for every test so call counts stay isolated. */
function makeNext(): jest.Mock {
    return jest.fn();
}

// Typed handles for mocked functions — avoids repetitive casts in each test.
const mockJwtVerify  = jwt.verify        as jest.Mock;
const mockFindById   = userService.findById as jest.Mock;

// Reusable token fixture — content doesn't matter because jwt.verify is mocked.
const VALID_TOKEN = 'valid.jwt.token';
const USER_ID     = 42;

/**
 * A minimal user object the middleware attaches to req.userdata.
 * lockoutUntil is included here because the middleware must check it (FR-30).
 * UserRepository.findUserById will be updated (via eager-loaded security
 * status) to return this field alongside the base UserOutput fields.
 */
const ACTIVE_USER = {
    userID:       USER_ID,
    username:     'testuser',
    email:        'test@example.com',
    createdAt:    new Date('2024-01-01'),
    lockoutUntil: null,           // no active lockout
};

const LOCKED_USER = {
    ...ACTIVE_USER,
    lockoutUntil: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in the future
};

const EXPIRED_LOCK_USER = {
    ...ACTIVE_USER,
    lockoutUntil: new Date(Date.now() - 1000), // 1 second in the past — lockout lifted
};

// ─── test suite ─────────────────────────────────────────────────────────────

describe('authMiddleware — authenticate', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── Functional test cases ──────────────────────────────────────────────

    /**
     * TC-AUTH-MW-F-001
     * FR-25, FR-30
     * Happy path: valid Bearer token, JWT verifies cleanly, user exists in DB
     * and has no active lockout.
     * Expected: req.userdata populated with user object; next() called with
     * no arguments (i.e. no error forwarded).
     */
    it('TC-AUTH-MW-F-001: valid token and active user — attaches userdata and calls next()', async () => {
        mockJwtVerify.mockReturnValue({ id: USER_ID });
        mockFindById.mockResolvedValue(ACTIVE_USER);

        const req  = makeReq(`Bearer ${VALID_TOKEN}`);
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        // Middleware must call next() with no arguments on success.
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(/* nothing */);

        // User object must be attached so downstream route handlers can read it.
        expect((req as any).userdata).toMatchObject({ userID: USER_ID });

        // Repository must have been queried with the ID extracted from the token.
        expect(mockFindById).toHaveBeenCalledWith(USER_ID);
    });

    /**
     * TC-AUTH-MW-F-002
     * FR-25
     * No Authorization header at all (e.g. anonymous request to a protected route).
     * Expected: next(UnauthorizedError) called; repository never queried.
     */
    it('TC-AUTH-MW-F-002: missing Authorization header — calls next(UnauthorizedError)', async () => {
        const req  = makeReq(); // no header
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        expect(next.mock.calls[0][0].statusCode).toBe(401);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-MW-F-003
     * FR-25
     * Authorization header present but does not use the Bearer scheme
     * (e.g. "Basic dXNlcjpwYXNz").
     * Expected: next(UnauthorizedError); repository never queried.
     */
    it('TC-AUTH-MW-F-003: non-Bearer Authorization scheme — calls next(UnauthorizedError)', async () => {
        const req  = makeReq('Basic dXNlcjpwYXNz');
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-MW-F-004
     * FR-25
     * Authorization header is exactly "Bearer " with an empty token string.
     * Expected: next(UnauthorizedError); repository never queried.
     */
    it('TC-AUTH-MW-F-004: Bearer scheme with empty token — calls next(UnauthorizedError)', async () => {
        const req  = makeReq('Bearer ');
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-MW-F-005
     * FR-25
     * Token string is present but jwt.verify throws JsonWebTokenError
     * (malformed signature, wrong secret, tampered payload, etc.).
     * Expected: next(UnauthorizedError); repository never queried.
     */
    it('TC-AUTH-MW-F-005: invalid / malformed JWT — calls next(UnauthorizedError)', async () => {
        const jwtError = new (jwt as any).JsonWebTokenError('invalid signature');
        mockJwtVerify.mockImplementation(() => { throw jwtError; });

        const req  = makeReq('Bearer tampered.token.here');
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-MW-F-006
     * FR-25, NFR-10
     * Token was valid when issued but jwt.verify throws TokenExpiredError.
     * Expected: next(UnauthorizedError); repository never queried.
     */
    it('TC-AUTH-MW-F-006: expired JWT — calls next(UnauthorizedError)', async () => {
        const expiredError = new (jwt as any).TokenExpiredError('jwt expired', new Date());
        mockJwtVerify.mockImplementation(() => { throw expiredError; });

        const req  = makeReq(`Bearer ${VALID_TOKEN}`);
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        expect(mockFindById).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-MW-F-007
     * FR-30
     * Token is valid and not expired, but the user ID in the payload no longer
     * exists in the database (account deleted after the token was issued).
     * Expected: next(UnauthorizedError); req.userdata not set.
     */
    it('TC-AUTH-MW-F-007: user not found in DB (deleted account) — calls next(UnauthorizedError)', async () => {
        mockJwtVerify.mockReturnValue({ id: USER_ID });
        mockFindById.mockResolvedValue(null); // user no longer exists

        const req  = makeReq(`Bearer ${VALID_TOKEN}`);
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        expect((req as any).userdata).toBeUndefined();
    });

    /**
     * TC-AUTH-MW-F-008
     * FR-30, NFR-07/08
     * Token is valid, user exists, but lockoutUntil is in the future — the
     * account is currently locked due to failed login attempts.
     * Expected: next(UnauthorizedError); req.userdata not set.
     */
    it('TC-AUTH-MW-F-008: account locked (lockoutUntil in future) — calls next(UnauthorizedError)', async () => {
        mockJwtVerify.mockReturnValue({ id: USER_ID });
        mockFindById.mockResolvedValue(LOCKED_USER);

        const req  = makeReq(`Bearer ${VALID_TOKEN}`);
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
        expect((req as any).userdata).toBeUndefined();
    });

    /**
     * TC-AUTH-MW-F-009
     * FR-30
     * Token is valid, user exists, and lockoutUntil is in the past — the
     * 24-hour lockout window has already elapsed; the account is accessible again.
     * Expected: next() called with no error; req.userdata populated.
     */
    it('TC-AUTH-MW-F-009: lockout period has expired — treats account as active', async () => {
        mockJwtVerify.mockReturnValue({ id: USER_ID });
        mockFindById.mockResolvedValue(EXPIRED_LOCK_USER);

        const req  = makeReq(`Bearer ${VALID_TOKEN}`);
        const res  = makeRes();
        const next = makeNext();

        await AuthMiddleware.authenticate(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(/* nothing */);
        expect((req as any).userdata).toMatchObject({ userID: USER_ID });
    });

    // ── Non-functional test cases ──────────────────────────────────────────

    /**
     * TC-AUTH-MW-NF-001
     * NFR-09 — Performance
     * 100 concurrent requests, each with a valid token and an active user.
     * Expected: all resolve successfully; average processing time ≤ 200 ms.
     *
     * Note: this is a unit-level smoke test with mocked I/O.
     * A realistic benchmark against a live server with a real database should
     * be added to the integration / load-test suite.
     */
    it('TC-AUTH-MW-NF-001: handles 100 concurrent valid requests; avg ≤ 200 ms', async () => {
        mockJwtVerify.mockReturnValue({ id: USER_ID });
        mockFindById.mockResolvedValue(ACTIVE_USER);

        const concurrency = 100;
        const startMs = Date.now();

        const runs = await Promise.all(
            Array.from({ length: concurrency }, () => {
                const req  = makeReq(`Bearer ${VALID_TOKEN}`);
                const res  = makeRes();
                const next = makeNext();
                return AuthMiddleware.authenticate(req as Request, res as Response, next).then(() => ({ req, next }));
            })
        );

        const avgMs = (Date.now() - startMs) / concurrency;

        // Every request must pass through without error.
        runs.forEach(({ req, next }: { req: Partial<Request>; next: jest.Mock }) => {
            expect(next).toHaveBeenCalledWith(/* nothing */);
            expect((req as any).userdata).toMatchObject({ userID: USER_ID });
        });

        expect(avgMs).toBeLessThanOrEqual(200);
    }, 10_000);

});
