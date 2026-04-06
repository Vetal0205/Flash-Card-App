/**
 * Tests for CollectionService — exportAsPdf (UC-11)
 *
 * These are specification (TDD) tests: they define the expected contract
 * for the PDF export feature. They will fail with "Not implemented" until
 * the service is fully implemented, at which point all should pass.
 *
 */

// Mocks (must appear before the module under test is imported)
// CollectionRepository and FlashcardService are mocked to isolate
// CollectionService logic and avoid real DB calls.

jest.mock('../../api/repositories/CollectionRepository', () => ({
    __esModule: true,
    default: {
        findCollectionById: jest.fn(),
        updateCollection: jest.fn(),
        deleteCollectionById: jest.fn(),
        createCollection: jest.fn(),
        findAllCollectionsByUser: jest.fn(),
    },
}));

// CollectionService.exportAsPdf fetches flashcards directly from
// FlashcardRepository, not via FlashcardService.
jest.mock('../../api/repositories/FlashcardRepository', () => ({
    __esModule: true,
    default: {
        findAllFlashcardsByCollection: jest.fn(),
    },
}));

// Mock pdfkit — PDF generation is an implementation detail.
// We verify the service returns a Buffer without executing real PDF rendering.
// The mock emits 'data' and 'end' synchronously when doc.end() is called,
// matching the event-driven pattern that most pdfkit integrations rely on.
jest.mock('pdfkit', () => {
    const EventEmitter = require('events');
    return jest.fn().mockImplementation(() => {
        const doc = new EventEmitter() as any;
        // Fake methods that mimics real pdfkit's chaining API (doc.text(...).fontSize(...).font(...).addPage()...)
        doc.text      = jest.fn().mockReturnThis();
        doc.fontSize  = jest.fn().mockReturnThis();
        doc.font      = jest.fn().mockReturnThis();
        doc.addPage   = jest.fn().mockReturnThis();
        doc.moveDown  = jest.fn().mockReturnThis();
        // In real PDFKit, calling .end() finishes the PDF stream.
        doc.end = jest.fn().mockImplementation(() => {
            doc.emit('data', Buffer.from('%PDF-1.4 mock'));
            doc.emit('end');
        });
        return doc;
    });
});

import collectionService from '../../api/services/CollectionService';
import CollectionRepository from '../../api/repositories/CollectionRepository';
import FlashcardRepository from '../../api/repositories/FlashcardRepository';

import {
    CollectionNotFoundError,
    EmptyCollectionError,
} from '../../errors';

// Helpers

// Returns a minimal mock Collection-like object for findCollectionById to resolve with. 
function makeMockCollection(collectionID: number, collectionName = 'Default Collection') {
    return {
        collectionID,
        userID: 42,
        collectionName,
        description: null,
        visibility: 'private' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

// Returns a minimal mock Flashcard-like object.
// question / answer default to standard ASCII text unless overridden
// (used by TC-UC11-F-005 to inject special characters).
function makeMockFlashcard(flashcardID: number, question = `Question ${flashcardID}?`, answer = `Answer ${flashcardID}.`) {
    return {
        flashcardID,
        collectionID: 1,
        question,
        answer,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

const COLLECTION_ID         = 1;
const NONEXISTENT_ID        = 99999;
const FIVE_MOCK_FLASHCARDS  = Array.from({ length: 5 }, (_, i) => makeMockFlashcard(i + 1));

// Test Suite
describe('CollectionService — exportAsPdf', () => {
    const mockFindCollectionById            = CollectionRepository.findCollectionById as jest.Mock;
    const mockFindAllFlashcardsByCollection = FlashcardRepository.findAllFlashcardsByCollection as jest.Mock;

    beforeEach(() => {
        // Without clearing, the next test might still see calls from the previous one.
        jest.clearAllMocks();

        // Defaults.
        mockFindCollectionById.mockResolvedValue(makeMockCollection(COLLECTION_ID));
        mockFindAllFlashcardsByCollection.mockResolvedValue(FIVE_MOCK_FLASHCARDS);
    });

    // Functional test cases

    /*
     * TC-UC11-F-001
     * FR-05
     * User exports a collection ("Biology 101") with 5 populated flashcards.
     * Expected: a non-empty Buffer is returned (the PDF bytes).
     */
    it('TC-UC11-F-001: returns a Buffer when exporting a valid collection with 5 flashcards', async () => {
        // defines what happens when the service calls repo.findCollectionById and repo.findAllFlashcardsByCollection.
        // if we call mocked findCollectionById, it will resolve with a mock collection object.
        mockFindCollectionById.mockResolvedValue(makeMockCollection(COLLECTION_ID, 'Biology 101'));
        mockFindAllFlashcardsByCollection.mockResolvedValue(FIVE_MOCK_FLASHCARDS);

        const result = await collectionService.exportAsPdf(COLLECTION_ID);

        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        // Service must look up the collection and its flashcards exactly once.
        expect(mockFindCollectionById).toHaveBeenCalledTimes(1);
        expect(mockFindCollectionById).toHaveBeenCalledWith(COLLECTION_ID);
        expect(mockFindAllFlashcardsByCollection).toHaveBeenCalledTimes(1);
        expect(mockFindAllFlashcardsByCollection).toHaveBeenCalledWith(COLLECTION_ID);
    });

    /**
     * TC-UC11-F-002
     * FR-05
     * User attempts to export collection "Empty Set" which has 0 cards.
     * Expected: EmptyCollectionError thrown before any PDF generation.
     */
    it('TC-UC11-F-002: throws EmptyCollectionError when the collection has 0 flashcards', async () => {
        mockFindCollectionById.mockResolvedValue(makeMockCollection(COLLECTION_ID, 'Empty Set'));
        mockFindAllFlashcardsByCollection.mockResolvedValue([]);

        const result = collectionService.exportAsPdf(COLLECTION_ID);

        await expect(result).rejects.toThrow(EmptyCollectionError);
        await expect(result).rejects.toThrow('Cannot export an empty collection.');
        // Collection lookup must still happen, but no PDF work should follow.
        expect(mockFindCollectionById).toHaveBeenCalledWith(COLLECTION_ID);
    });

    /**
     * TC-UC11-F-003
     * FR-05
     * User requests export for collection ID 99999, which does not exist.
     * Expected: CollectionNotFoundError thrown; no flashcard lookup attempted.
     */
    it('TC-UC11-F-003: throws CollectionNotFoundError when the collection ID does not exist', async () => {
        mockFindCollectionById.mockResolvedValue(null);

        const result = collectionService.exportAsPdf(NONEXISTENT_ID);

        await expect(result).rejects.toThrow(CollectionNotFoundError);
        await expect(result).rejects.toThrow('Collection not found.');
        // Must abort before fetching flashcards.
        expect(mockFindAllFlashcardsByCollection).not.toHaveBeenCalled();
    });

    /**
     * TC-UC11-F-004
     * FR-05
     * Collection "Special Chars" contains cards with © symbols and Japanese text (こんにちは).
     * Expected: PDF generation succeeds; a non-empty Buffer is returned.
     *
     * This test verifies the service does not crash or lose data when card
     * text contains non-ASCII / multi-byte characters.
     */
    it('TC-UC11-F-004: returns a Buffer for a collection containing special characters and non-Latin text', async () => {
        const specialCards = [
            makeMockFlashcard(1, 'What does © mean?', 'Copyright symbol.'),
            makeMockFlashcard(2, 'こんにちは means what?', 'Hello in Japanese.'),
            makeMockFlashcard(3, 'Résumé contains which accent?', 'Acute accent (é).'),
        ];
        mockFindCollectionById.mockResolvedValue(makeMockCollection(COLLECTION_ID, 'Special Chars'));
        mockFindAllFlashcardsByCollection.mockResolvedValue(specialCards);

        const result = await collectionService.exportAsPdf(COLLECTION_ID);

        expect(Buffer.isBuffer(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(mockFindCollectionById).toHaveBeenCalledTimes(1);
        expect(mockFindCollectionById).toHaveBeenCalledWith(COLLECTION_ID);
        expect(mockFindAllFlashcardsByCollection).toHaveBeenCalledTimes(1);
        expect(mockFindAllFlashcardsByCollection).toHaveBeenCalledWith(COLLECTION_ID);
    });

    // Non-functional test cases

    /**
     * TC-UC11-NF-001
     * NFR-09 — Performance
     * 100 concurrent export requests, each for a collection with 10 flashcards.
     * Expected: all resolve with a Buffer; average response time ≤ 2 000 ms.
     *
     * Note: this is a unit-level smoke test with fully mocked I/O.
     * Later will be translated to a realistic benchmark , running this against a live PDF renderer with a real database. 
     */
    it('TC-UC11-NF-001: handles 100 concurrent exports; average response time ≤ 2 s', async () => {
        const tenCards = Array.from({ length: 10 }, (_, i) => makeMockFlashcard(i + 1));
        mockFindAllFlashcardsByCollection.mockResolvedValue(tenCards);

        const concurrency = 100;
        const startMs = Date.now();

        const results = await Promise.all(
            Array.from({ length: concurrency }, () =>
                collectionService.exportAsPdf(COLLECTION_ID)
            )
        );

        const avgMs = (Date.now() - startMs) / concurrency;

        expect(results).toHaveLength(concurrency);
        results.forEach((r) => expect(Buffer.isBuffer(r)).toBe(true));
        expect(avgMs).toBeLessThanOrEqual(2000);
    // Run this test up to 10 seconds.
    }, 10_000);
});
