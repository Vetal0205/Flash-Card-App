/**
 * Tests for CollectionService — importFromFile (UC-10)
 *
 * These are specification (TDD) tests: they define the expected contract
 * for the import feature. They will fail with "Not implemented" until
 * the service is fully implemented, at which point all should pass.
 *
 * Author: Vitalii Belsiubniak
 * TC-UC10-F-007 (auth / HTTP 401) is enforced entirely by Express middleware
 * before the controller is reached — it is not testable at the service level
 * and is marked todo for an integration test suite.
 *
 * TC-UC10-NF-002 (keyboard accessibility) and TC-UC10-NF-003 (cross-browser)
 * are frontend/E2E concerns that require Playwright or Cypress — also todo.
 */

import { Readable } from 'stream';

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

// FlashcardService is mocked instead of FlashcardRepository because
// CollectionService delegates flashcard creation to FlashcardService.createBulk —
// it never touches the repository directly.
jest.mock('../../api/services/FlashcardService', () => ({
    __esModule: true,
    default: {
        createBulk: jest.fn(),
    },
}));


import collectionService from '../../api/services/CollectionService';
import flashcardService from '../../api/services/FlashcardService';

import {
    CorruptedFileError,
    EmptyFileError,
    FileTooLargeError,
    InvalidFlashcardFormatError,
    NoFileSelectedError,
    UnsupportedFileFormatError,
} from '../../errors';

// Helpers

// Field values for a mock Express.Multer.File object — see https://www.jsdocs.io/package/%40types/multer
// originalname: string — original file name, like "cards.txt"
// mimetype: string    — file type, like "text/plain" or "application/pdf"
// content: string | Buffer — actual file contents
function makeMockFile(originalname: string, mimetype: string, content: string | Buffer): Express.Multer.File {

    // if content is a string convert it into a Node.js Buffer using UTF-8 encoding
    // otherwise: it is already a Buffer, so use it as-is
    const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
    return {
        // from <input type="file" name="file" />
        fieldname: 'file',
        // 'cards.txt', 'valid_flashcards.pdf', etc.
        originalname,
        // encoding metadata — rarely checked by application code
        encoding: '7bit',
        // "text/plain", "application/pdf", "image/png" etc.
        mimetype,
        // stream is consumed by Multer before the route handler runs; the service
        // reads file.buffer (memoryStorage), so this field is never used.
        // Provided as an empty readable only to satisfy the Express.Multer.File interface.
        stream: Readable.from([]) as unknown as Express.Multer.File['stream'],
        size: buffer.length,
        // mock is not pretending the file was saved to disk
        destination: '',
        filename: originalname,
        // mock file is not stored on disk
        path: '',
        // Q/A bytes — what the service actually reads
        buffer,
    };
}

const COLLECTION_ID = 1;

// Reusable valid Q/A content
const TWO_QA_TXT =
    'Q: What is photosynthesis? A: The process by which plants convert sunlight into food.\n' +
    'Q: What is mitosis? A: Cell division producing two identical daughter cells.';

const UNSTRUCTURED_TXT = 'Hello world\nThis is not a flashcard\nRandom text here.';

// Test Suite
describe('CollectionService — importFromFile', () => {
    // TypeScript still sees flashcardService.createBulk as its original method type,
    // so we cast it to jest.Mock to access mock helpers like mockResolvedValue.
    const mockCreateBulk = flashcardService.createBulk as jest.Mock;

    beforeEach(() => {
        // Without clearing, the next test might still see calls from the previous one.
        jest.clearAllMocks();

        // Default: createBulk succeeds and returns 0.
        // Individual tests override this when they need a specific count returned.
        // mockResolvedValue is sugar for: jest.fn().mockImplementation(() => Promise.resolve(value))
        mockCreateBulk.mockResolvedValue(0);
    });

    // Functional test cases

    /**
     * TC-UC10-F-001
     * FR-01, FR-23
     * Valid .txt file with 2 correctly formatted Q/A pairs.
     * Expected: 2 flashcards imported, success message returned.
     */
    it('TC-UC10-F-001: imports 2 flashcards from a valid .txt file', async () => {
        mockCreateBulk.mockResolvedValue(2);
        const file = makeMockFile('valid_flashcards.txt', 'text/plain', TWO_QA_TXT);

        const result = await collectionService.importFromFile(COLLECTION_ID, file);

        expect(result.count).toBe(2);
        expect(result.message).toBe('2 flashcard(s) successfully imported.');
        // CollectionService must delegate to FlashcardService — once, with the parsed pairs
        expect(mockCreateBulk).toHaveBeenCalledTimes(1);
        expect(mockCreateBulk).toHaveBeenCalledWith(
            COLLECTION_ID,
            expect.arrayContaining([
                expect.objectContaining({ question: expect.any(String), answer: expect.any(String) }),
            ])
        );
    });

    /**
     * TC-UC10-F-002
     * FR-22
     * Unsupported .pdf file (PDF is export-only; not accepted as import input).
     * Expected: UnsupportedFileFormatError thrown, FlashcardService never called.
     */
    it('TC-UC10-F-002: rejects a .pdf file with UnsupportedFileFormatError', async () => {
        const file = makeMockFile(
            'flashcards.pdf',
            'application/pdf',
            Buffer.from('%PDF-1.4 placeholder')
        );
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(UnsupportedFileFormatError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('Unsupported file format.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    /**
     * TC-UC10-F-003
     * FR-22
     * Unsupported .docx file.
     * Expected: UnsupportedFileFormatError thrown, FlashcardService never called.
     */
    it('TC-UC10-F-003: rejects a .docx file with UnsupportedFileFormatError', async () => {
        const file = makeMockFile(
            'flashcards.docx',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            Buffer.from('PK\x03\x04')
        );
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(UnsupportedFileFormatError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('Unsupported file format.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    /**
     * TC-UC10-F-004
     * FR-22
     * Unsupported .jpg file.
     * Expected: UnsupportedFileFormatError thrown, FlashcardService never called.
     */
    it('TC-UC10-F-004: rejects a .jpg file with UnsupportedFileFormatError', async () => {
        const file = makeMockFile(
            'photo.jpg',
            'image/jpeg',
            Buffer.from('\xFF\xD8\xFF')
        );
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(UnsupportedFileFormatError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('Unsupported file format.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    /**
     * TC-UC10-F-005
     * FR-22
     * No file provided (undefined — multer found no attached file).
     * Expected: NoFileSelectedError thrown, FlashcardService never called.
     */
    it('TC-UC10-F-005: throws NoFileSelectedError when no file is provided', async () => {
        const result = collectionService.importFromFile(COLLECTION_ID, undefined);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(NoFileSelectedError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('Please select a file to upload.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    /**
     * TC-UC10-F-006
     * FR-01, FR-22
     * Empty .txt file (0 bytes).
     * Expected: EmptyFileError thrown, FlashcardService never called.
     */
    it('TC-UC10-F-006: throws EmptyFileError for an empty .txt file', async () => {
        const file = makeMockFile('empty.txt', 'text/plain', '');
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(EmptyFileError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('The uploaded file contains no recognizable flashcard data.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    /**
     * TC-UC10-F-007
     * FR-01, FR-23
     * Supported file type (.txt) but content has no recognisable Q/A pairs.
     * Expected: InvalidFlashcardFormatError thrown, FlashcardService never called.
     */
    it('TC-UC10-F-007: throws InvalidFlashcardFormatError when file has no Q/A structure', async () => {
        const file = makeMockFile('unstructured.txt', 'text/plain', UNSTRUCTURED_TXT);
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(InvalidFlashcardFormatError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('No valid flashcard format detected.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    /**
     * TC-UC10-F-008 
     * FR-01, FR-22
     * Exceptional: file contains null bytes / control characters (corrupted).
     * Expected: CorruptedFileError thrown, FlashcardService never called.
     */
    it('TC-UC10-F-008: rejects a file containing null bytes / control characters', async () => {
        const file = makeMockFile(
            'corrupt.txt',
            'text/plain',
            Buffer.from('Q: \x00broken\x01 A: \x02value\x03')
        );
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(CorruptedFileError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('File contains null bytes/ control characters.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    /**
     * TC-UC10-F-009
     * Exceptional: file contains only whitespace.
     * Expected: EmptyFileError (no usable content detected).
     */
    it('TC-UC10-F-009: throws EmptyFileError for a file containing only whitespace', async () => {
        const file = makeMockFile('whitespace.txt', 'text/plain', '   \n\t\n   ');
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(EmptyFileError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('The uploaded file contains no recognizable flashcard data.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

    // Non-functional

    /**
     * TC-UC10-NF-001
     * NFR-09 — Performance
     * 100 concurrent uploads of a valid .txt file with 5 Q/A pairs each.
     * Expected: all resolve successfully; average response time ≤ 2 000 ms.
     *
     * Note: this is a unit-level smoke test with mocked I/O.
     * Later will be translated to a realistic benchmark , running this against a live server with a real database. 
     */
    it('TC-UC10-NF-001: handles 100 concurrent imports; average response time ≤ 2 s', async () => {
        const qaContent = Array.from(
            { length: 5 },
            (_, i) => `Q: Question ${i + 1}? A: Answer ${i + 1}.`
        ).join('\n');

        mockCreateBulk.mockResolvedValue(5);

        const concurrency = 100;
        const startMs = Date.now();

        const results = await Promise.all(
            Array.from({ length: concurrency }, () =>
                collectionService.importFromFile(
                    COLLECTION_ID,
                    makeMockFile('valid_flashcards.txt', 'text/plain', qaContent)
                )
            )
        );

        const avgMs = (Date.now() - startMs) / concurrency;

        expect(results).toHaveLength(concurrency);
        results.forEach((r) => expect(r.count).toBe(5));
        expect(avgMs).toBeLessThanOrEqual(2000);
    // Run this test up to 10 seconds.
    }, 10_000);

    /**
     * TC-UC10-NF-004
     * NFR-13 — Performance (file size limit)
     * Upload a .txt file just over the 50 MB limit.
     * Expected: FileTooLargeError thrown before any parsing or DB work.
     */
    it('TC-UC10-NF-004: throws FileTooLargeError for files exceeding 50 MB', async () => {
        const largeBuffer = Buffer.alloc(51 * 1024 * 1024, 'a');
        const file = makeMockFile('huge.txt', 'text/plain', largeBuffer);
        const result = collectionService.importFromFile(COLLECTION_ID, file);
        // tests that function throws particular error type.
        await expect(result).rejects.toThrow(FileTooLargeError);
        // tests that function throws particular error message.
        await expect(result).rejects.toThrow('File size exceeds the maximum allowed limit of 50 MB.');

        expect(mockCreateBulk).not.toHaveBeenCalled();
    });

});
