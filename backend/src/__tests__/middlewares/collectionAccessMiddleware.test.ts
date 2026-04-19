/**
 * Tests for CollectionAccessMiddleware (UC-3/5/8/10/11/16)
 *
 * Verifies that the middleware correctly gates access to collections:
 *   - owner always has access
 *   - any authenticated user can access a public collection
 *   - private collections block non-owners with 403
 *   - non-existent collection IDs yield 404
 *   - routes without :collectionId are passed through untouched
 *
 * Collection.findByPk is mocked to avoid a real DB connection.
 * req.userdata is set manually, reflecting that AuthMiddleware already ran.
 */

// Mock Collection.findByPk before importing the middleware.
jest.mock('../../api/models/Collection', () => ({
    __esModule: true,
    default: {
        findByPk: jest.fn(),
    },
}));

import { Request, Response, NextFunction } from 'express';
import CollectionAccessMiddleware from '../../api/middlewares/CollectionAccessMiddleware';
import Collection from '../../api/models/Collection';
import { BadRequestError, CollectionNotFoundError, ForbiddenError } from '../../errors';

// Helpers

function makeCollection(overrides: Partial<{
    collectionID: number;
    userID: number;
    visibility: 'private' | 'public';
}> = {}): Collection {
    return {
        collectionID: 1,
        userID: 10,
        collectionName: 'Test Collection',
        description: null,
        visibility: 'private' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as unknown as Collection;
}

// Builds a minimal Express Request mock.
// userdata reflects an already-authenticated user (AuthMiddleware has run).
function makeReq(overrides: {
    params?: Record<string, string>;
    userID?: number;
} = {}): Partial<Request> {
    return {
        params: overrides.params ?? {},
        userdata: overrides.userID !== undefined
            ? { userID: overrides.userID, username: 'testuser', email: 'test@test.com', createdAt: new Date() }
            : undefined,
    } as Partial<Request>;
}

function makeRes(): Partial<Response> {
    return {};
}

function makeNext(): NextFunction {
    return jest.fn();
}

const mockFindByPk = Collection.findByPk as jest.Mock;

const OWNER_ID     = 10;
const OTHER_ID     = 99;

beforeEach(() => {
    jest.clearAllMocks();
});

describe('CollectionAccessMiddleware — forCollection', () => {

    /**
     * TC-CAM-F-001
     * UC-3, UC-5, UC-8, UC-10, UC-11, UC-16
     * No :collectionId param (e.g. GET / or POST /).
     * Expected: next() called without touching the DB or attaching req.collection.
     */
    it('TC-CAM-F-001: passes through when no collectionId param is present', async () => {
        const req  = makeReq({ params: {}, userID: OWNER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(next).toHaveBeenCalledWith(/* nothing */);
        expect(next).toHaveBeenCalledTimes(1);
        expect(mockFindByPk).not.toHaveBeenCalled();
        expect(req.collection).toBeUndefined();
    });

    /**
     * TC-CAM-F-002
     * UC-3, UC-5, UC-8, UC-10, UC-11, UC-16
     * Owner accesses their own private collection.
     * Expected: collection attached to req, next() called without error.
     */
    it('TC-CAM-F-002: grants access and attaches collection for the owner', async () => {
        const collection = makeCollection({ userID: OWNER_ID, visibility: 'private' });
        mockFindByPk.mockResolvedValue(collection);

        const req  = makeReq({ params: { collectionId: '1' }, userID: OWNER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(mockFindByPk).toHaveBeenCalledWith(1);
        expect(req.collection).toBe(collection);
        expect(next).toHaveBeenCalledWith(/* nothing */);
    });

    /**
     * TC-CAM-F-003
     * FR-04
     * Authenticated non-owner accesses a public collection.
     * Expected: access granted, collection attached.
     */
    it('TC-CAM-F-003: grants access to a public collection for a non-owner', async () => {
        const collection = makeCollection({ userID: OWNER_ID, visibility: 'public' });
        mockFindByPk.mockResolvedValue(collection);

        const req  = makeReq({ params: { collectionId: '1' }, userID: OTHER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(req.collection).toBe(collection);
        expect(next).toHaveBeenCalledWith(/* nothing */);
    });

    /**
     * TC-CAM-F-004
     * UC-3, UC-5, UC-8, UC-10, UC-11, UC-16
     * Non-owner attempts to access a private collection.
     * Expected: next(ForbiddenError) called, req.collection not set.
     */
    it('TC-CAM-F-004: denies access to a private collection for a non-owner with ForbiddenError', async () => {
        const collection = makeCollection({ userID: OWNER_ID, visibility: 'private' });
        mockFindByPk.mockResolvedValue(collection);

        const req  = makeReq({ params: { collectionId: '1' }, userID: OTHER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
        expect(req.collection).toBeUndefined();
    });

    /**
     * TC-CAM-F-005
     * UC-3, UC-5, UC-8, UC-10, UC-11, UC-16
     * Collection ID does not exist in the DB.
     * Expected: next(CollectionNotFoundError) called.
     */
    it('TC-CAM-F-005: calls next with CollectionNotFoundError when collection does not exist', async () => {
        mockFindByPk.mockResolvedValue(null);

        const req  = makeReq({ params: { collectionId: '99999' }, userID: OWNER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(CollectionNotFoundError));
        expect(req.collection).toBeUndefined();
    });

    /**
     * TC-CAM-F-006
     * UC-3, UC-5, UC-8, UC-10, UC-11, UC-16
     * Non-numeric :collectionId in the URL — malformed input, not a missing resource.
     * Expected: next(BadRequestError) called, DB never queried.
     */
    it('TC-CAM-F-006: calls next with BadRequestError for a non-numeric collectionId', async () => {
        const req  = makeReq({ params: { collectionId: 'abc' }, userID: OWNER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(next).toHaveBeenCalledWith(expect.any(BadRequestError));
        expect(mockFindByPk).not.toHaveBeenCalled();
    });

    /**
     * TC-CAM-F-007
     * UC-3, UC-5, UC-8, UC-10, UC-11, UC-16
     * Owner accesses a public collection they own.
     * Expected: access granted (owner check is sufficient, visibility irrelevant).
     */
    it('TC-CAM-F-007: grants access to an owner regardless of visibility', async () => {
        const collection = makeCollection({ userID: OWNER_ID, visibility: 'public' });
        mockFindByPk.mockResolvedValue(collection);

        const req  = makeReq({ params: { collectionId: '1' }, userID: OWNER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(req.collection).toBe(collection);
        expect(next).toHaveBeenCalledWith(/* nothing */);
    });

    /**
     * TC-CAM-F-008
     * UC-3, UC-5, UC-8, UC-10, UC-11, UC-16
     * DB throws an unexpected error.
     * Expected: next(error) called, request does not hang.
     */
    it('TC-CAM-F-008: forwards unexpected DB errors to next', async () => {
        const dbError = new Error('DB connection lost');
        mockFindByPk.mockRejectedValue(dbError);

        const req  = makeReq({ params: { collectionId: '1' }, userID: OWNER_ID });
        const next = makeNext();

        await CollectionAccessMiddleware.forCollection(req as Request, makeRes() as Response, next);

        expect(next).toHaveBeenCalledWith(dbError);
    });
});
