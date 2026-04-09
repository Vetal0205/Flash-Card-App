/**
 * Tests for AuthService — register, login, logout, lockout helpers
 *
 * These are specification (TDD) tests: they define the expected contract
 * for the authentication feature. They will fail with "Not implemented" until
 * the service is fully implemented, at which point all should pass.
 *
 * Author: Vitalii Belsiubniak
 *
 * Functional requirements covered:
 *   FR-25  — login accepts email OR username as credential
 *   FR-27  — password complexity enforced on register
 *   FR-29  — Remember Me extends token lifetime
 *   FR-30  — account lockout after MAX_FAILED_LOGIN_ATTEMPTS; NFR-07/08
 *
 */

// ─── mocks (must appear before module under test) ────────────────────────────

// UserService is mocked so AuthService tests do not depend on repository calls
// directly — AuthService delegates all user lookups, creation, and security
// status updates to UserService.
jest.mock('../../api/services/UserService', () => ({
    __esModule: true,
    default: {
        create:                jest.fn(),
        findById:              jest.fn(),
        findByEmail:           jest.fn(),
        findByUsername:        jest.fn(),
        updateSecurityStatus:  jest.fn(),
    },
}));

// jsonwebtoken is mocked so tests do not depend on a real secret or time.
jest.mock('jsonwebtoken');

// bcrypt is mocked to avoid expensive hashing in unit tests.
jest.mock('bcrypt');

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import authService from '../../api/services/AuthService';
import userService from '../../api/services/UserService';
import { ConflictError, UnauthorizedError, ValidationError } from '../../errors';
import { MAX_FAILED_LOGIN_ATTEMPTS, ACCOUNT_LOCKOUT_DURATION_MS } from '../../constants';

const mockFindById             = userService.findById             as jest.Mock;
const mockUpdateSecurityStatus = userService.updateSecurityStatus as jest.Mock;
const mockUserServiceCreate    = userService.create               as jest.Mock;
const mockFindByEmail          = userService.findByEmail          as jest.Mock;
const mockFindByUsername       = userService.findByUsername       as jest.Mock;

const mockJwtSign   = jwt.sign   as jest.Mock;
const mockBcryptHash    = bcrypt.hash    as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;

const MOCK_TOKEN = 'mock.jwt.token';

// Full User row (includes passwordHash — only for internal auth use).
const MOCK_USER_FULL = {
    userID:       1,
    username:     'johndoe',
    email:        'john@example.com',
    passwordHash: '$2b$10$hashedpassword',
    createdAt:    new Date('2024-01-01'),
};

// UserOutput (passwordHash omitted) — what createUser and findUserById return.
const MOCK_USER_OUTPUT = {
    userID:    1,
    username:  'johndoe',
    email:     'john@example.com',
    createdAt: new Date('2024-01-01'),
};

const VALID_REGISTER_DATA = {
    username: 'johndoe',
    email:    'john@example.com',
    password: 'SecurePass1234',   // meets FR-27: 12+ chars, uppercase, number
};

const VALID_LOGIN_DATA = {
    credential: 'john@example.com',
    password:   'SecurePass1234',
};

// Helpers 

// Default happy-path mock state for login tests. Override per-test as needed. */
function setupHappyLoginMocks() {
    mockFindByEmail.mockResolvedValue(MOCK_USER_FULL);
    mockFindByUsername.mockResolvedValue(MOCK_USER_FULL);
    mockBcryptCompare.mockResolvedValue(true);
    mockJwtSign.mockReturnValue(MOCK_TOKEN);
    mockUpdateSecurityStatus.mockResolvedValue(undefined);
}

// Register suite

describe('AuthService — register', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockBcryptHash.mockResolvedValue('$2b$10$hashedpassword');
        mockUserServiceCreate.mockResolvedValue(MOCK_USER_OUTPUT);
        mockJwtSign.mockReturnValue(MOCK_TOKEN);
        // No duplicate by default
        mockFindByEmail.mockResolvedValue(null);
        mockFindByUsername.mockResolvedValue(null);
    });

    /**
     * TC-AUTH-SVC-F-001
     * FR-25, FR-27, UC2-F-1, UC2-F-6
     * Valid registration data: unique username/email, password meets complexity
     * (12+ chars, at least one uppercase letter and one number).
     * Special characters must NOT be required (UC2-F-6).
     * Expected: password hashed, user created in DB, JWT returned.
     */
    it('TC-AUTH-SVC-F-001: valid data — hashes password, creates user, returns token', async () => {
        const result = await authService.register(VALID_REGISTER_DATA);

        expect(result).toHaveProperty('token', MOCK_TOKEN);
        // Password must never be stored in plain text (FR-26).
        expect(mockBcryptHash).toHaveBeenCalledWith(VALID_REGISTER_DATA.password, expect.any(Number));
        expect(mockUserServiceCreate).toHaveBeenCalledTimes(1);
        expect(mockUserServiceCreate).toHaveBeenCalledWith(
            expect.objectContaining<{ username: string; email: string; passwordHash: string }>({
                username:     VALID_REGISTER_DATA.username,
                email:        VALID_REGISTER_DATA.email,
                // passwordHash must NOT be the raw password
                passwordHash: expect.not.stringContaining(VALID_REGISTER_DATA.password),
            })
        );
        expect(mockJwtSign).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-AUTH-SVC-F-002
     * FR-25
     * Email already registered — cannot create a duplicate account.
     * Expected: throws an error with HTTP 409 status; user is NOT created.
     */
    it('TC-AUTH-SVC-F-002: duplicate email — throws a conflict error (409)', async () => {
        mockFindByEmail.mockResolvedValue(MOCK_USER_FULL);

        const result = authService.register(VALID_REGISTER_DATA);

        await expect(result).rejects.toThrow(ConflictError);
        expect(mockUserServiceCreate).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-003
     * FR-27
     * Password is too short (fewer than 12 characters).
     * Expected: throws a validation error before any DB work is done.
     */
    it('TC-AUTH-SVC-F-003: password too short (< 12 chars) — throws ValidationError', async () => {
        const result = authService.register({ ...VALID_REGISTER_DATA, password: 'SecureP1' }); // 8 chars — below 12

        await expect(result).rejects.toThrow(ValidationError);
        expect(mockUserServiceCreate).not.toHaveBeenCalled();
        expect(mockBcryptHash).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-004
     * FR-27
     * Password is 12+ characters but fails complexity rules (no uppercase, no number).
     * Expected: throws a validation error before any DB work.
     */
    it('TC-AUTH-SVC-F-004: password lacks complexity (no uppercase, no number) — throws ValidationError', async () => {
        const result = authService.register({ ...VALID_REGISTER_DATA, password: 'alllowercaseonly' }); // 16 chars, no uppercase/digit

        await expect(result).rejects.toThrow(ValidationError);
        expect(mockUserServiceCreate).not.toHaveBeenCalled();
        expect(mockBcryptHash).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-019
     * UC2-F-4
     * Username is empty — must be rejected with a validation error before any DB work.
     * Expected: ValidationError thrown; no DB calls made.
     */
    it('TC-AUTH-SVC-F-019: empty username — throws ValidationError (UC2-F-4)', async () => {
        const result = authService.register({ ...VALID_REGISTER_DATA, username: '' });

        await expect(result).rejects.toThrow(ValidationError);
        expect(mockUserServiceCreate).not.toHaveBeenCalled();
        expect(mockBcryptHash).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-020
     * UC2-F-3
     * Username already registered — cannot create a duplicate account.
     * Expected: ConflictError thrown; user is NOT created.
     */
    it('TC-AUTH-SVC-F-020: duplicate username — throws ConflictError (UC2-F-3)', async () => {
        mockFindByUsername.mockResolvedValue(MOCK_USER_FULL);

        const result = authService.register(VALID_REGISTER_DATA);

        await expect(result).rejects.toThrow(ConflictError);
        expect(mockUserServiceCreate).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-004b
     * FR-28
     * Email address is syntactically invalid (missing @, missing domain, etc.).
     * Expected: ValidationError thrown before any DB work is done.
     */
    it('TC-AUTH-SVC-F-004b: invalid email format — throws ValidationError', async () => {
        const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', 'spaces in@email.com'];

        for (const email of invalidEmails) {
            const result = authService.register({ ...VALID_REGISTER_DATA, email });
            await expect(result).rejects.toThrow(ValidationError);
        }

        expect(mockFindByEmail).not.toHaveBeenCalled();
        expect(mockUserServiceCreate).not.toHaveBeenCalled();
        expect(mockBcryptHash).not.toHaveBeenCalled();
    });

});

// Login suite

describe('AuthService — login', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        setupHappyLoginMocks();
    });

    /**
     * TC-AUTH-SVC-F-005
     * FR-25
     * Login with a valid email address and correct password.
     * Expected: token returned; failed-attempt counter reset.
     */
    it('TC-AUTH-SVC-F-005: valid email credential + correct password — returns token', async () => {
        const result = await authService.login(VALID_LOGIN_DATA);

        expect(result).toHaveProperty('token', MOCK_TOKEN);
        expect(mockFindByEmail).toHaveBeenCalledWith(VALID_LOGIN_DATA.credential);
        expect(mockBcryptCompare).toHaveBeenCalledTimes(1);
        expect(mockJwtSign).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-AUTH-SVC-F-006
     * FR-25
     * Login with a valid username (not email) and correct password.
     * The service must accept username as a credential alternative to email.
     * Expected: token returned.
     */
    it('TC-AUTH-SVC-F-006: valid username credential + correct password — returns token', async () => {
        const result = await authService.login({ credential: 'johndoe', password: 'Secure@123' });

        expect(result).toHaveProperty('token', MOCK_TOKEN);
        expect(mockBcryptCompare).toHaveBeenCalledTimes(1);
        expect(mockJwtSign).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-AUTH-SVC-F-007
     * FR-25
     * Credential does not match any user (email not found, username not found).
     * Expected: UnauthorizedError thrown; bcrypt never called.
     */
    it('TC-AUTH-SVC-F-007: non-existent credential — throws UnauthorizedError', async () => {
        mockFindByEmail.mockResolvedValue(null);
        mockFindByUsername.mockResolvedValue(null);

        const result = authService.login({ credential: 'ghost@example.com', password: 'Secure@123' });

        await expect(result).rejects.toThrow(UnauthorizedError);
        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-008
     * FR-30, NFR-07
     * User exists but password is wrong.
     * Expected: UnauthorizedError thrown; updateSecurityStatus called to
     * increment failedLoginAttempts (FR-30 lockout pipeline).
     */
    it('TC-AUTH-SVC-F-008: wrong password — throws UnauthorizedError and increments failed attempts', async () => {
        mockBcryptCompare.mockResolvedValue(false);

        const result = authService.login(VALID_LOGIN_DATA);

        await expect(result).rejects.toThrow(UnauthorizedError);
        // Service must record the failed attempt so lockAccount can fire at threshold.
        expect(mockUpdateSecurityStatus).toHaveBeenCalledTimes(1);
    });

    /**
     * TC-AUTH-SVC-F-009
     * FR-30, NFR-08
     * Account is currently locked (lockoutUntil is in the future).
     * The service must reject the attempt immediately without checking the password.
     * Expected: UnauthorizedError thrown; bcrypt never called.
     */
    it('TC-AUTH-SVC-F-009: account locked (lockoutUntil in future) — throws UnauthorizedError without checking password', async () => {
        mockFindByEmail.mockResolvedValue({
            ...MOCK_USER_FULL,
            lockoutUntil: new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MS),
        });

        const result = authService.login(VALID_LOGIN_DATA);

        await expect(result).rejects.toThrow(UnauthorizedError);
        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-010
     * FR-29
     * rememberMe = true — token should have an extended expiry (e.g. 30 days).
     * Expected: jwt.sign called with an expiry significantly longer than the
     * default session lifetime.
     */
    it('TC-AUTH-SVC-F-010: rememberMe=true — jwt.sign called with extended expiry', async () => {
        await authService.login({ ...VALID_LOGIN_DATA, rememberMe: true });

        const [, , options] = mockJwtSign.mock.calls[0];
        // "30d" or equivalent — any form that expresses a multi-day lifetime
        expect(options).toMatchObject({ expiresIn: expect.stringMatching(/30d|2592000/) });
    });

    /**
     * TC-AUTH-SVC-F-011
     * FR-29
     * rememberMe = false (or omitted) — token should use the standard
     * short session expiry (e.g. 1 hour).
     * Expected: jwt.sign called with a short expiry.
     */
    it('TC-AUTH-SVC-F-011: rememberMe=false — jwt.sign called with short session expiry', async () => {
        await authService.login({ ...VALID_LOGIN_DATA, rememberMe: false });

        const [, , options] = mockJwtSign.mock.calls[0];
        expect(options).toMatchObject({ expiresIn: expect.stringMatching(/1h|3600/) });
    });

    /**
     * TC-AUTH-SVC-F-012
     * FR-25
     * Successful login resets the failedLoginAttempts counter so a subsequent
     * failed login does not carry over state from a previous session.
     * Expected: updateSecurityStatus called with failedLoginAttempts: 0.
     */
    it('TC-AUTH-SVC-F-012: successful login — resets failed-attempt counter', async () => {
        await authService.login(VALID_LOGIN_DATA);

        expect(mockUpdateSecurityStatus).toHaveBeenCalledWith(
            MOCK_USER_FULL.userID,
            expect.objectContaining({ failedLoginAttempts: 0 }),
        );
    });

    /**
     * TC-AUTH-SVC-F-022
     * UC1-F-4
     * Credential or password field is empty — must be rejected with a validation
     * error before any DB or bcrypt work is done.
     * Expected: ValidationError thrown for empty credential and for empty password.
     */
    it('TC-AUTH-SVC-F-022: empty credential or password — throws ValidationError (UC1-F-4)', async () => {
        await expect(authService.login({ credential: '', password: 'SecurePass1234' }))
            .rejects.toThrow(ValidationError);
        await expect(authService.login({ credential: 'john@example.com', password: '' }))
            .rejects.toThrow(ValidationError);

        expect(mockFindByEmail).not.toHaveBeenCalled();
        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    /**
     * TC-AUTH-SVC-F-023
     * UC1-F-7
     * On the attempt that reaches MAX_FAILED_LOGIN_ATTEMPTS, the account must be
     * locked: updateSecurityStatus is called with a lockoutUntil date in the future.
     * Expected: UnauthorizedError thrown; lockoutUntil set in the update payload.
     */
    it('TC-AUTH-SVC-F-023: 3rd wrong password — account locked (UC1-F-7)', async () => {
        mockBcryptCompare.mockResolvedValue(false);
        mockFindById.mockResolvedValue({
            ...MOCK_USER_OUTPUT,
            failedLoginAttempts: MAX_FAILED_LOGIN_ATTEMPTS - 1,
        });

        const before = Date.now();
        await expect(authService.login(VALID_LOGIN_DATA)).rejects.toThrow(UnauthorizedError);
        const after = Date.now();

        const [, payload] = mockUpdateSecurityStatus.mock.calls[0];
        expect(payload.lockoutUntil).toBeInstanceOf(Date);
        expect(new Date(payload.lockoutUntil).getTime()).toBeGreaterThanOrEqual(before + ACCOUNT_LOCKOUT_DURATION_MS - 5000);
        expect(new Date(payload.lockoutUntil).getTime()).toBeLessThanOrEqual(after  + ACCOUNT_LOCKOUT_DURATION_MS + 5000);
    });

});

// ─── incrementFailedAttempts ─────────────────────────────────────────────────

describe('AuthService — incrementFailedAttempts', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockFindById.mockResolvedValue({ ...MOCK_USER_OUTPUT, failedLoginAttempts: 0 });
        mockUpdateSecurityStatus.mockResolvedValue(undefined);
    });

    /**
     * TC-AUTH-SVC-F-013
     * FR-30
     * Attempt count is below the threshold — account must NOT be locked.
     * Expected: updateSecurityStatus increments count; lockoutUntil unchanged.
     */
    it('TC-AUTH-SVC-F-013: below threshold — increments count without locking', async () => {
        mockFindById.mockResolvedValue({
            ...MOCK_USER_OUTPUT,
            failedLoginAttempts: MAX_FAILED_LOGIN_ATTEMPTS - 2,
        });

        await authService.incrementFailedAttempts(MOCK_USER_OUTPUT.userID);

        expect(mockUpdateSecurityStatus).toHaveBeenCalledWith(
            MOCK_USER_OUTPUT.userID,
            expect.objectContaining({ failedLoginAttempts: MAX_FAILED_LOGIN_ATTEMPTS - 1 }),
        );
        // lockoutUntil must NOT be set when below the threshold
        const [, payload] = mockUpdateSecurityStatus.mock.calls[0];
        expect(payload.lockoutUntil).toBeUndefined();
    });

    /**
     * TC-AUTH-SVC-F-014
     * FR-30, NFR-07
     * Attempt count reaches MAX_FAILED_LOGIN_ATTEMPTS — account must be locked
     * for ACCOUNT_LOCKOUT_DURATION_MS (24 h).
     * Expected: updateSecurityStatus includes lockoutUntil set to ~now + 24h.
     */
    it('TC-AUTH-SVC-F-014: reaching threshold — locks the account for 24 h', async () => {
        mockFindById.mockResolvedValue({
            ...MOCK_USER_OUTPUT,
            failedLoginAttempts: MAX_FAILED_LOGIN_ATTEMPTS - 1,
        });

        const before = Date.now();
        await authService.incrementFailedAttempts(MOCK_USER_OUTPUT.userID);
        const after = Date.now();

        expect(mockUpdateSecurityStatus).toHaveBeenCalledWith(
            MOCK_USER_OUTPUT.userID,
            expect.objectContaining({ failedLoginAttempts: MAX_FAILED_LOGIN_ATTEMPTS }),
        );
        const [, payload] = mockUpdateSecurityStatus.mock.calls[0];
        const lockTime = new Date(payload.lockoutUntil).getTime();
        // lockoutUntil must be approximately now + 24 h (±5 s tolerance)
        expect(lockTime).toBeGreaterThanOrEqual(before + ACCOUNT_LOCKOUT_DURATION_MS - 5000);
        expect(lockTime).toBeLessThanOrEqual(after  + ACCOUNT_LOCKOUT_DURATION_MS + 5000);
    });

});

// ─── lockAccount ─────────────────────────────────────────────────────────────

describe('AuthService — lockAccount', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateSecurityStatus.mockResolvedValue(undefined);
    });

    /**
     * TC-AUTH-SVC-F-015
     * FR-30, NFR-08
     * Locking an account sets lockoutUntil to exactly now + ACCOUNT_LOCKOUT_DURATION_MS.
     * Expected: updateSecurityStatus called with a Date ~24 h from now.
     */
    it('TC-AUTH-SVC-F-015: sets lockoutUntil to now + 24 h', async () => {
        const before = Date.now();
        await authService.lockAccount(MOCK_USER_OUTPUT.userID);
        const after = Date.now();

        expect(mockUpdateSecurityStatus).toHaveBeenCalledWith(
            MOCK_USER_OUTPUT.userID,
            expect.objectContaining({ lockoutUntil: expect.any(Date) }),
        );
        const [, payload] = mockUpdateSecurityStatus.mock.calls[0];
        const lockTime = new Date(payload.lockoutUntil).getTime();
        // time margin error allowed: lockoutUntil must be approximately now + 24 h (±5 s tolerance)
        expect(lockTime).toBeGreaterThanOrEqual(before + ACCOUNT_LOCKOUT_DURATION_MS - 5000);
        expect(lockTime).toBeLessThanOrEqual(after  + ACCOUNT_LOCKOUT_DURATION_MS + 5000);
    });

});

// ─── resetFailedAttempts ─────────────────────────────────────────────────────

describe('AuthService — resetFailedAttempts', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateSecurityStatus.mockResolvedValue(undefined);
    });

    /**
     * TC-AUTH-SVC-F-016
     * FR-30
     * After a successful login the counter and lockout must both be cleared.
     * Expected: updateSecurityStatus called with failedLoginAttempts=0 and
     * lockoutUntil=null.
     */
    it('TC-AUTH-SVC-F-016: resets failedLoginAttempts to 0 and clears lockoutUntil', async () => {
        await authService.resetFailedAttempts(MOCK_USER_OUTPUT.userID);

        expect(mockUpdateSecurityStatus).toHaveBeenCalledWith(
            MOCK_USER_OUTPUT.userID,
            expect.objectContaining({ failedLoginAttempts: 0, lockoutUntil: null }),
        );
    });

});

// ─── updateLastActive ─────────────────────────────────────────────────────────

describe('AuthService — updateLastActive', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateSecurityStatus.mockResolvedValue(undefined);
    });

    /**
     * TC-AUTH-SVC-F-017
     * FR-24 (lastActivityAt used for inactivity auto-logout)
     * Expected: updateSecurityStatus called with lastActivityAt changed from its
     * previous value (null when never set) to a Date.
     */
    it('TC-AUTH-SVC-F-017: updates lastActivityAt from its previous value to a Date', async () => {
        // lastActivityAt is null before the first activity is recorded.
        const previousLastActivityAt = null;

        await authService.updateLastActive(MOCK_USER_OUTPUT.userID);

        const [, payload] = mockUpdateSecurityStatus.mock.calls[0];
        // Must have changed — no longer null.
        expect(payload.lastActivityAt).not.toBe(previousLastActivityAt);
        // Must be a valid Date, not a raw number or string.
        expect(payload.lastActivityAt).toBeInstanceOf(Date);
    });

});

// ─── logout ──────────────────────────────────────────────────────────────────

describe('AuthService — logout', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateSecurityStatus.mockResolvedValue(undefined);
    });

    /**
     * TC-AUTH-SVC-F-018
     * FR-24
     * Logout must record the user's last activity so the session timestamps
     * remain accurate for inactivity tracking.
     * Expected: updateLastActive (or equivalent) invoked with the correct userID.
     */
    it('TC-AUTH-SVC-F-018: records last activity for the logged-out user', async () => {
        await authService.logout(MOCK_USER_OUTPUT.userID);

        // The service must update lastActivityAt as part of logout cleanup.
        expect(mockUpdateSecurityStatus).toHaveBeenCalledWith(
            MOCK_USER_OUTPUT.userID,
            expect.objectContaining({ lastActivityAt: expect.any(Date) }),
        );
    });

});

// ─── non-functional ──────────────────────────────────────────────────────────

describe('AuthService — non-functional', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        setupHappyLoginMocks();
    });

    /**
     * TC-AUTH-SVC-NF-001
     * NFR-09 — Performance
     * 100 concurrent login attempts with valid credentials.
     * Expected: all resolve successfully; average processing time ≤ 2 000 ms.
     *
     * Note: unit-level smoke test with fully mocked I/O.
     * A realistic load test against a live server should be added later.
     */
    it('TC-AUTH-SVC-NF-001: handles 100 concurrent logins; avg ≤ 2 s', async () => {
        const concurrency = 100;
        const startMs = Date.now();

        const results = await Promise.all(
            Array.from({ length: concurrency }, () => authService.login(VALID_LOGIN_DATA))
        );

        const avgMs = (Date.now() - startMs) / concurrency;

        expect(results).toHaveLength(concurrency);
        results.forEach((r) => expect(r).toHaveProperty('token'));
        expect(avgMs).toBeLessThanOrEqual(2000);
    }, 10_000);

});
