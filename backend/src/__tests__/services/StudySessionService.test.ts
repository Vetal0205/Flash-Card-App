/**
 * Tests for StudySessionService — start, pause, resume, recordAnswer, complete, getSummary
 *
 * These are specification (TDD) tests: they define the expected contract
 * for the study-session feature. They will fail with "Not implemented" until
 * the service is fully implemented, at which point all should pass.
 *
 * Author: Vitalii Besliubniak
 *
 * Functional requirements covered:
 *   FR-10  — randomised card order with flagged cards distributed proportionally
 *   FR-16  — record answer (known / unknown / skipped)
 *   FR-17  — update UserFlashcardProgress on known / unknown responses; skipped is neutral
 *   FR-19  — pause / resume with accumulated durationSeconds (NFR-05/06)
 *   FR-20  — session summary: known / unknown / skipped counts
 *
 * Note on duration tracking: pause() accumulates durationSeconds using
 * resumedAt (if set) or startedAt as the segment-start marker.
 * resume() sets resumedAt = now so the next pause() measures from that point.
 * startedAt is immutable after session creation.
 */

// ─── mocks (must appear before module under test) ────────────────────────────

jest.mock('../../api/repositories/StudySessionRepository', () => ({
    __esModule: true,
    default: {
        createSession:           jest.fn(),
        findActiveSessionByCollection: jest.fn(),
        findSessionById:         jest.fn(),
        updateSession:           jest.fn(),
        createCardOrder:         jest.fn(),
        getCardOrder:            jest.fn(),
        recordAnswer:            jest.fn(),
        getSummary:              jest.fn(),
        // moveCardToEndOfOrder:    jest.fn(),
    },
}));

jest.mock('../../api/services/FlashcardService', () => ({
    __esModule: true,
    default: {
        getAllByCollection:   jest.fn(),
        getFlagged:           jest.fn(),
        findOrCreateProgress: jest.fn(),
        incrementProgress:    jest.fn(),
    },
}));

import studySessionService from '../../api/services/StudySessionService';
import studySessionRepository from '../../api/repositories/StudySessionRepository';
import flashcardService from '../../api/services/FlashcardService';

// ─── typed mock aliases ───────────────────────────────────────────────────────

const mockCreateSession      = studySessionRepository.createSession           as jest.Mock;
const mockFindActive         = studySessionRepository.findActiveSessionByCollection  as jest.Mock;
const mockFindById           = studySessionRepository.findSessionById          as jest.Mock;
const mockUpdateSession      = studySessionRepository.updateSession            as jest.Mock;
const mockCreateCardOrder    = studySessionRepository.createCardOrder          as jest.Mock;
const mockGetCardOrder       = studySessionRepository.getCardOrder             as jest.Mock;
// const mockMoveCardToEnd   = studySessionRepository.moveCardToEndOfOrder     as jest.Mock;
const mockRepoRecordAnswer   = studySessionRepository.recordAnswer             as jest.Mock;
const mockRepoGetSummary     = studySessionRepository.getSummary               as jest.Mock;

const mockGetAllByCollection  = flashcardService.getAllByCollection   as jest.Mock;
const mockGetFlagged          = flashcardService.getFlagged           as jest.Mock;
const mockFindOrCreateProgress = flashcardService.findOrCreateProgress as jest.Mock;
const mockIncrementProgress    = flashcardService.incrementProgress    as jest.Mock;

// ─── fixtures ────────────────────────────────────────────────────────────────

const USER_ID       = 1;
const COLLECTION_ID = 1;
const SESSION_ID    = 1;
const FLASHCARD_ID  = 1;

const MOCK_COLLECTION = { collectionID: COLLECTION_ID, userID: USER_ID } as any;

const MOCK_SESSION = {
    sessionID:       SESSION_ID,
    userID:          USER_ID,
    collectionID:    COLLECTION_ID,
    status:          'active' as const,
    currentIndex:    0,
    startedAt:       new Date('2026-01-01T10:00:00.000Z'),
    resumedAt:       null,
    pausedAt:        null,
    completedAt:     null,
    durationSeconds: 0,
};

const MOCK_PROGRESS = {
    userID:             USER_ID,
    flashcardID:        FLASHCARD_ID,
    knownCount:         4,
    unknownCount:       2,
    isFlaggedDifficult: false,
    updatedAt:          new Date(),
};

// 6 flashcards; IDs 1 and 3 are the flagged ones in distribution tests.
const MOCK_FLASHCARDS = [1, 2, 3, 4, 5, 6].map((n) => ({
    flashcardID:  n,
    collectionID: COLLECTION_ID,
    question:     `Q${n}`,
    answer:       `A${n}`,
    createdAt:    new Date(),
    updatedAt:    new Date(),
}));

const MOCK_FLAGGED = [MOCK_FLASHCARDS[0], MOCK_FLASHCARDS[2]]; // IDs 1, 3

const MOCK_CARD_ORDER = MOCK_FLASHCARDS.map((f, i) => ({
    sessionID:      SESSION_ID,
    sequenceNumber: i,
    flashcardID:    f.flashcardID,
}));

// ─── start ───────────────────────────────────────────────────────────────────

describe('StudySessionService — start', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockFindActive.mockResolvedValue(null);
        mockCreateSession.mockResolvedValue(MOCK_SESSION);
        mockGetAllByCollection.mockResolvedValue(MOCK_FLASHCARDS);
        mockGetFlagged.mockResolvedValue(MOCK_FLAGGED);
        mockCreateCardOrder.mockResolvedValue(undefined);
        mockGetCardOrder.mockResolvedValue(MOCK_CARD_ORDER);
    });

    /**
     * TC-SSS-SVC-F-001
     * FR-10
     * No existing active session -> new session created and card order persisted.
     * Expected: createSession called once; createCardOrder called;
     *           result contains session and full ordered flashcard ID list.
     */
    it('TC-SSS-SVC-F-001: no active session — creates session and persists card order', async () => {
        const result = await studySessionService.start(USER_ID, MOCK_COLLECTION);

        expect(mockCreateSession).toHaveBeenCalledTimes(1);
        expect(mockCreateCardOrder).toHaveBeenCalledTimes(1);
        expect(mockGetCardOrder).not.toHaveBeenCalled();
        expect(result).toHaveProperty('session');
        expect(result).toHaveProperty('cardOrder');
        expect((result as any).cardOrder).toHaveLength(MOCK_FLASHCARDS.length);
        expect((result as any).session).toMatchObject({ sessionID: MOCK_SESSION.sessionID });
    });

    /**
     * TC-SSS-SVC-F-002
     * Active session already exists for this collection — must be auto-resumed.
     * Expected: createSession NOT called; existing session and its stored card order returned.
     */
    it('TC-SSS-SVC-F-002: active session exists — auto-resumes without creating a new one', async () => {
        mockFindActive.mockResolvedValue(MOCK_SESSION);

        const result = await studySessionService.start(USER_ID, MOCK_COLLECTION);

        expect(mockCreateSession).not.toHaveBeenCalled();
        expect(mockCreateCardOrder).not.toHaveBeenCalled();
        expect(mockGetAllByCollection).not.toHaveBeenCalled();
        expect(mockGetCardOrder).toHaveBeenCalledWith(SESSION_ID);
        expect((result as any).session).toMatchObject({ sessionID: MOCK_SESSION.sessionID });
        expect((result as any).cardOrder).toHaveLength(MOCK_FLASHCARDS.length);
    });

    /**
     * TC-SSS-SVC-F-003
     * FR-10 — card order must be a valid permutation of all collection flashcards.
     * Expected: sorted cardOrder equals sorted flashcard IDs (all present, no duplicates).
     */
    it('TC-SSS-SVC-F-003: card order is a valid permutation of all collection flashcards', async () => {
        const result = await studySessionService.start(USER_ID, MOCK_COLLECTION);

        const cardOrder: number[] = (result as any).cardOrder;
        const sortedOrder    = [...cardOrder].sort((a, b) => a - b);
        const expectedSorted = MOCK_FLASHCARDS.map((f) => f.flashcardID).sort((a, b) => a - b);

        expect(sortedOrder).toEqual(expectedSorted);
    });

    /**
     * TC-SSS-SVC-F-005
     * No flagged cards in the collection — all cards must still be included.
     * Expected: cardOrder length equals total flashcard count.
     */
    it('TC-SSS-SVC-F-005: no flagged cards — all cards included in card order', async () => {
        mockGetFlagged.mockResolvedValue([]);

        const result = await studySessionService.start(USER_ID, MOCK_COLLECTION);

        expect((result as any).cardOrder).toHaveLength(MOCK_FLASHCARDS.length);
    });

});

// ─── getActive ───────────────────────────────────────────────────────────────

describe('StudySessionService — getActive', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * TC-SSS-SVC-F-006
     * getActive is scoped to a specific collection.
     * Expected: repository called with both userID and collectionID; session returned.
     */
    it('TC-SSS-SVC-F-006: returns active session for the given collection', async () => {
        mockFindActive.mockResolvedValue(MOCK_SESSION);

        const result = await studySessionService.getActive(USER_ID, MOCK_COLLECTION);

        expect(result).toMatchObject({ sessionID: MOCK_SESSION.sessionID });
        expect(mockFindActive).toHaveBeenCalledWith(USER_ID, COLLECTION_ID);
    });

    /**
     * TC-SSS-SVC-F-007
     * No active session for this collection.
     * Expected: null returned.
     */
    it('TC-SSS-SVC-F-007: returns null when no active session exists', async () => {
        mockFindActive.mockResolvedValue(null);

        const result = await studySessionService.getActive(USER_ID, MOCK_COLLECTION);

        expect(result).toBeNull();
    });

});

// ─── getById ─────────────────────────────────────────────────────────────────

describe('StudySessionService — getById', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * TC-SSS-SVC-F-008
     * Session found by ID.
     * Expected: session returned.
     */
    it('TC-SSS-SVC-F-008: returns session when found', async () => {
        mockFindById.mockResolvedValue(MOCK_SESSION);

        const result = await studySessionService.getById(SESSION_ID);

        expect(result).toMatchObject({ sessionID: SESSION_ID });
        expect(mockFindById).toHaveBeenCalledWith(SESSION_ID);
    });

    /**
     * TC-SSS-SVC-F-009
     * Session not found.
     * Expected: null returned.
     */
    it('TC-SSS-SVC-F-009: returns null when session does not exist', async () => {
        mockFindById.mockResolvedValue(null);

        const result = await studySessionService.getById(SESSION_ID);

        expect(result).toBeNull();
    });

});

// ─── pause ───────────────────────────────────────────────────────────────────

describe('StudySessionService — pause', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateSession.mockResolvedValue(undefined);
    });

    /**
     * TC-SSS-SVC-F-010
     * FR-19 — first pause of a session active for ~60 s (never resumed, resumedAt is null).
     * pause() falls back to startedAt as the segment-start marker.
     * Expected: updateSession called with status='paused', pausedAt set,
     *           and durationSeconds ≈ 60 (elapsed since startedAt).
     */
    it('TC-SSS-SVC-F-010: first pause — accumulates elapsed seconds into durationSeconds', async () => {
        const startedAt = new Date(Date.now() - 60_000);
        const session = { ...MOCK_SESSION, startedAt, resumedAt: null, durationSeconds: 0 };

        await studySessionService.pause(session as any);

        const [id, payload] = mockUpdateSession.mock.calls[0];
        expect(id).toBe(SESSION_ID);
        expect(payload.status).toBe('paused');
        expect(payload.pausedAt).toBeInstanceOf(Date);
        expect(payload.durationSeconds).toBeGreaterThanOrEqual(59);
        expect(payload.durationSeconds).toBeLessThanOrEqual(62);
    });

    /**
     * TC-SSS-SVC-F-011
     * FR-19 — second pause after a resume adds the new segment to the prior total.
     * resumedAt is the segment-start marker set by resume(); startedAt is immutable.
     * Expected: durationSeconds = previously accumulated 60 + ~30 s elapsed since resumedAt = ~90.
     */
    it('TC-SSS-SVC-F-011: subsequent pause — adds current segment to accumulated durationSeconds', async () => {
        const resumedAt = new Date(Date.now() - 30_000);
        const session = { ...MOCK_SESSION, resumedAt, durationSeconds: 60 };

        await studySessionService.pause(session as any);

        const [, payload] = mockUpdateSession.mock.calls[0];
        expect(payload.durationSeconds).toBeGreaterThanOrEqual(89);
        expect(payload.durationSeconds).toBeLessThanOrEqual(92);
    });

});

// ─── resume ──────────────────────────────────────────────────────────────────

describe('StudySessionService — resume', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockFindById.mockResolvedValue({ ...MOCK_SESSION, status: 'paused', pausedAt: new Date() });
        mockUpdateSession.mockResolvedValue(undefined);
    });

    /**
     * TC-SSS-SVC-F-012
     * FR-19 — resume clears pause state and marks the start of a new active segment.
     * resumedAt is set to now so the next pause() uses it as the segment-start marker.
     * Expected: updateSession called with status='active', pausedAt=null,
     *           resumedAt ≈ now.
     */
    it('TC-SSS-SVC-F-012: resume — sets active, clears pausedAt, sets resumedAt', async () => {
        const before = Date.now();
        await studySessionService.resume(MOCK_SESSION as any);
        const after = Date.now();

        const [id, payload] = mockUpdateSession.mock.calls[0];
        expect(id).toBe(SESSION_ID);
        expect(payload.status).toBe('active');
        expect(payload.pausedAt).toBeNull();
        expect(payload.resumedAt).toBeInstanceOf(Date);
        expect(payload.resumedAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(payload.resumedAt.getTime()).toBeLessThanOrEqual(after);
        expect(payload).not.toHaveProperty('startedAt');
    });

});

// ─── recordAnswer ─────────────────────────────────────────────────────────────

describe('StudySessionService — recordAnswer', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockFindById.mockResolvedValue(MOCK_SESSION);
        mockGetCardOrder.mockResolvedValue(MOCK_CARD_ORDER);
        mockRepoRecordAnswer.mockResolvedValue(undefined);
        mockUpdateSession.mockResolvedValue(undefined);
        // mockMoveCardToEnd.mockResolvedValue(undefined);
        mockFindOrCreateProgress.mockResolvedValue(MOCK_PROGRESS);
        mockIncrementProgress.mockResolvedValue(undefined);
    });

    /**
     * TC-SSS-SVC-F-013
     * FR-16, FR-17 — 'known' response records the answer and updates knownCount.
     * Expected: repository recordAnswer called with responseType='known';
     *           flashcardService.updateProgress called with data containing knownCount.
     */
    it('TC-SSS-SVC-F-013: known — records response and updates knownCount', async () => {
        await studySessionService.recordAnswer(MOCK_SESSION as any, FLASHCARD_ID, 'known');

        expect(mockRepoRecordAnswer).toHaveBeenCalledWith(
            expect.objectContaining({ sessionID: SESSION_ID, flashcardID: FLASHCARD_ID, responseType: 'known' }),
        );
        expect(mockIncrementProgress).toHaveBeenCalledWith(USER_ID, FLASHCARD_ID, 'knownCount');
    });

    /**
     * TC-SSS-SVC-F-014
     * FR-16, FR-17 — 'unknown' response records the answer and updates unknownCount.
     * Expected: repository recordAnswer called with responseType='unknown';
     *           flashcardService.updateProgress called with data containing unknownCount.
     */
    it('TC-SSS-SVC-F-014: unknown — records response and updates unknownCount', async () => {
        await studySessionService.recordAnswer(MOCK_SESSION as any, FLASHCARD_ID, 'unknown');

        expect(mockRepoRecordAnswer).toHaveBeenCalledWith(
            expect.objectContaining({ responseType: 'unknown' }),
        );
        expect(mockIncrementProgress).toHaveBeenCalledWith(USER_ID, FLASHCARD_ID, 'unknownCount');
    });

    /**
     * TC-SSS-SVC-F-015
     * FR-16, FR-17 — 'skipped' is neutral and must not touch progress counts.
     * Expected: repository recordAnswer called; flashcardService.updateProgress NOT called.
     */
    it('TC-SSS-SVC-F-015: skipped — records response without touching progress counts', async () => {
        await studySessionService.recordAnswer(MOCK_SESSION as any, FLASHCARD_ID, 'skipped');

        expect(mockRepoRecordAnswer).toHaveBeenCalledWith(
            expect.objectContaining({ responseType: 'skipped' }),
        );
        expect(mockIncrementProgress).not.toHaveBeenCalled();
    });

    // TC-SSS-SVC-F-016: removed — auto-complete on last card is now client-driven

    /**
     * TC-SSS-SVC-F-017
     * recordAnswer always advances currentIndex by 1 for known/unknown.
     */
    it('TC-SSS-SVC-F-017: known answer — advances currentIndex by 1', async () => {
        mockFindById.mockResolvedValue({ ...MOCK_SESSION, currentIndex: 0 });

        await studySessionService.recordAnswer(MOCK_SESSION as any, FLASHCARD_ID, 'known');

        expect(mockUpdateSession).toHaveBeenCalledWith(
            SESSION_ID,
            expect.objectContaining({ currentIndex: 1 }),
        );
    });

});

// ─── complete ────────────────────────────────────────────────────────────────

describe('StudySessionService — complete', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateSession.mockResolvedValue(undefined);
    });

    /**
     * TC-SSS-SVC-F-018
     * FR-19 — explicit completion finalises durationSeconds and timestamps.
     * Session has 30 s previously accumulated; active segment started ~45 s ago.
     * Expected: updateSession called with status='completed', completedAt≈now,
     *           durationSeconds ≈ 30 + 45 = 75.
     */
    it('TC-SSS-SVC-F-018: explicit complete — sets status, completedAt, and final durationSeconds', async () => {
        const startedAt = new Date(Date.now() - 45_000);
        const session = { ...MOCK_SESSION, startedAt, durationSeconds: 30 };

        const before = Date.now();
        await studySessionService.complete(session as any);
        const after = Date.now();

        const [id, payload] = mockUpdateSession.mock.calls[0];
        expect(id).toBe(SESSION_ID);
        expect(payload.status).toBe('completed');
        expect(payload.completedAt).toBeInstanceOf(Date);
        expect(payload.completedAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(payload.completedAt.getTime()).toBeLessThanOrEqual(after);
        expect(payload.durationSeconds).toBeGreaterThanOrEqual(74);
        expect(payload.durationSeconds).toBeLessThanOrEqual(77);
    });

});

// ─── getSummary ──────────────────────────────────────────────────────────────

describe('StudySessionService — getSummary', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * TC-SSS-SVC-F-019
     * FR-20 — summary returns counted totals, not raw response rows.
     * Expected: { known: 3, unknown: 2, skipped: 1 } derived from 6 response rows.
     */
    it('TC-SSS-SVC-F-019: returns correct known / unknown / skipped counts', async () => {
        mockRepoGetSummary.mockResolvedValue([
            { responseType: 'known' },
            { responseType: 'known' },
            { responseType: 'known' },
            { responseType: 'unknown' },
            { responseType: 'unknown' },
            { responseType: 'skipped' },
        ]);

        const result = await studySessionService.getSummary(MOCK_SESSION as any);

        expect(result).toEqual({ known: 3, unknown: 2, skipped: 1 });
    });

});

// ─── guard: session not found ─────────────────────────────────────────────────
// TC-SSS-SVC-F-020 to F-023 removed: session existence and ownership are now
// enforced by SessionAccessMiddleware before the service is ever called.
// The service accepts a pre-resolved StudySession object and no longer fetches it.

// ─── duration accumulation (chained) ─────────────────────────────────────────

describe('StudySessionService — chained pause / resume / pause', () => {

    /**
     * TC-SSS-SVC-F-024
     * FR-19 — a pause -> resume -> pause cycle must accumulate both segments.
     * Segment 1: ~60 s. Segment 2 (after resume resets startedAt): ~30 s.
     * Expected: final durationSeconds ≈ 90.
     *
     * This test drives the service twice (pause then pause again after resume),
     * verifying the contract that resume() resets startedAt and pause() reads it.
     */
    it('TC-SSS-SVC-F-024: chained pause-resume-pause — accumulates both segments', async () => {
        jest.clearAllMocks();
        mockUpdateSession.mockResolvedValue(undefined);

        // First pause: session never resumed, resumedAt=null — falls back to startedAt
        const startedAt = new Date(Date.now() - 60_000);
        const session1 = { ...MOCK_SESSION, startedAt, resumedAt: null, durationSeconds: 0 };

        await studySessionService.pause(session1 as any);

        const [, pausePayload1] = mockUpdateSession.mock.calls[0];
        expect(pausePayload1.status).toBe('paused');
        expect(pausePayload1.pausedAt).toBeInstanceOf(Date);
        expect(pausePayload1.resumedAt).toBeNull();
        expect(pausePayload1.durationSeconds).toBeGreaterThanOrEqual(59);
        expect(pausePayload1.durationSeconds).toBeLessThanOrEqual(62);

        jest.clearAllMocks();
        mockUpdateSession.mockResolvedValue(undefined);

        // Resume: state is exactly what pause() wrote
        const session2 = {
            ...MOCK_SESSION,
            status: 'paused',
            pausedAt: pausePayload1.pausedAt,
            resumedAt: null,
            durationSeconds: pausePayload1.durationSeconds,
        };

        await studySessionService.resume(session2 as any);

        const [, resumePayload] = mockUpdateSession.mock.calls[0];
        expect(resumePayload.status).toBe('active');
        expect(resumePayload.resumedAt).toBeInstanceOf(Date);
        expect(resumePayload.pausedAt).toBeNull();

        jest.clearAllMocks();
        mockUpdateSession.mockResolvedValue(undefined);

        // Second pause: simulate 30 s elapsed since resumedAt
        const session3 = {
            ...MOCK_SESSION,
            resumedAt: new Date(resumePayload.resumedAt.getTime() - 30_000),
            durationSeconds: pausePayload1.durationSeconds,
        };

        await studySessionService.pause(session3 as any);

        const [, pausePayload2] = mockUpdateSession.mock.calls[0];
        expect(pausePayload2.status).toBe('paused');
        expect(pausePayload2.pausedAt).toBeInstanceOf(Date);
        expect(pausePayload2.resumedAt).toBeNull();
        expect(pausePayload2.durationSeconds).toBeGreaterThanOrEqual(pausePayload1.durationSeconds + 29);
        expect(pausePayload2.durationSeconds).toBeLessThanOrEqual(pausePayload1.durationSeconds + 32);
    });

});

// ─── D10: fixed card order on resume ─────────────────────────────────────────

describe('StudySessionService — card order fixed at session start (D10)', () => {

    /**
     * TC-SSS-SVC-F-025
     * D10 — when auto-resuming, the stored card order is returned as-is.
     * Even if the collection now has more cards, the resumed session uses
     * the order that was persisted when the session was created.
     * Expected: getAllByCollection NOT called; getCardOrder called with SESSION_ID;
     *           returned cardOrder matches the stored MOCK_CARD_ORDER.
     */
    it('TC-SSS-SVC-F-025: resume returns stored card order without recomputing', async () => {
        jest.clearAllMocks();

        const EXTENDED_FLASHCARDS = [
            ...MOCK_FLASHCARDS,
            { flashcardID: 7, collectionID: COLLECTION_ID, question: 'Q7', answer: 'A7', createdAt: new Date(), updatedAt: new Date() },
            { flashcardID: 8, collectionID: COLLECTION_ID, question: 'Q8', answer: 'A8', createdAt: new Date(), updatedAt: new Date() },
        ];

        mockFindActive.mockResolvedValue(MOCK_SESSION);
        mockGetCardOrder.mockResolvedValue(MOCK_CARD_ORDER);
        mockGetAllByCollection.mockResolvedValue(EXTENDED_FLASHCARDS);

        const result = await studySessionService.start(USER_ID, MOCK_COLLECTION);

        expect(mockGetAllByCollection).not.toHaveBeenCalled();
        expect(mockGetCardOrder).toHaveBeenCalledWith(SESSION_ID);
        expect((result as any).cardOrder).toHaveLength(MOCK_CARD_ORDER.length);
    });

});
