import Collection, { CollectionCreationAttributes, CollectionUpdateAttributes } from '../models/Collection';
import CollectionRepository from '../repositories/CollectionRepository';
import FlashcardService from './FlashcardService';
import type { Request } from 'express';
import { AppError, ConflictError, ForbiddenError } from '../../errors';
import PDFDocument from 'pdfkit';
import {
    NoFileSelectedError,
    FileTooLargeError,
    EmptyFileError,
    UnsupportedFileFormatError,
    CorruptedFileError,
    InvalidFlashcardFormatError,
    CollectionNotFoundError,
    EmptyCollectionError,
} from '../../errors';
import { MAX_FILE_SIZE } from '../../constants';
import { PARSERS } from '../../constants/fileParsers';

export interface ImportResult {
    count: number;
    message: string;
}

export interface ShareCollectionResult {
    shared: boolean;
    message: string;
    collection: Collection | null;
}

// Business logic for flashcard collections
// FR-01 (Use Case 10): import from file;
// FR-04 (Use Case 16): share;
// FR-05 (Use Case 11): export PDF;
// FR-07: list all;
// FR-12: create;
// FR-13: delete;
// FR-14: persistence across logout;
// FR-18: rename;
// FR-22: notify if file type is not supported;
// FR-23: validate file content format
//
// Methods that operate on a specific collection accept the pre-fetched Collection
// instance from CollectionAccessMiddleware .
// Ownership is still enforced inline for write operations.

class CollectionService {
    private ensureOwns(userID: number, collection: Collection): void {
        if (collection.userID !== userID) {
            throw new ForbiddenError();
        }
    }

    async getAllCollectionsByUser(userID: number): Promise<Collection[]> {
        // FR-07: list collections for authenticated user.
        return CollectionRepository.findAllCollectionsByUser(userID);
    }

    async getPublicCollections(page: number, limit: number): Promise<{ rows: Collection[]; count: number; totalPages: number }> {
        const offset = (page - 1) * limit;
        const { rows, count } = await CollectionRepository.findAllPublicCollections(limit, offset);
        return { rows, count, totalPages: Math.ceil(count / limit) };
    }

    async create(data: CollectionCreationAttributes): Promise<Collection> {
        // FR-12: create new collection.
        const collectionName = data.collectionName.trim().toLowerCase();

        const existing = await CollectionRepository.findByNameAndUser(data.userID, collectionName);
        if (existing) throw new ConflictError('A collection with this name already exists.');

        return CollectionRepository.createCollection({ ...data, collectionName });
    }

    async rename(userID: number, collection: Collection, collectionName: string): Promise<void> {
        this.ensureOwns(userID, collection);

        // FR-18: rename collection.
        await CollectionRepository.updateCollection(collection.collectionID, { collectionName: collectionName.trim() });
    }

    async update(userID: number, collection: Collection, data: CollectionUpdateAttributes): Promise<void> {
        this.ensureOwns(userID, collection);
        await CollectionRepository.updateCollection(collection.collectionID, data);
    }

    async delete(userID: number, collection: Collection): Promise<void> {
        // FR-13: owner-only collection deletion.
        this.ensureOwns(userID, collection);
        await CollectionRepository.deleteCollectionById(collection.collectionID);
    }

    async share(userID: number, collection: Collection): Promise<ShareCollectionResult> {
        // FR-04: frontend confirms; backend performs owner-only share action.
        this.ensureOwns(userID, collection);

        if (collection.visibility !== 'public') {
            await CollectionRepository.updateCollection(collection.collectionID, { visibility: 'public' });
            collection.visibility = 'public';
        }

        return {
            shared: true,
            message: 'Collection shared successfully.',
            collection,
        };
    }

    async importFromFile(
        userID: number,
        collection: Collection,
        file: Request['file'],
    ): Promise<ImportResult> {
        this.ensureOwns(userID, collection);

        // 1. Validate file is provided
        if (!file) {
            throw new NoFileSelectedError();
        }

        // 2. Check file size ≤ 50 MB
        if (file.size > MAX_FILE_SIZE) {
            throw new FileTooLargeError();
        }

        // 3. Check file content is non-empty / non-whitespace
        if (file.buffer.length === 0 || file.buffer.toString('utf-8').trim() === '') {
            throw new EmptyFileError();
        }

        // 4. Look up file.mimetype in PARSERS map
        const extractFn = PARSERS.get(file.mimetype);
        if (!extractFn) {
            throw new UnsupportedFileFormatError();
        }

        // 5. Reject files with null bytes / control characters
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(file.buffer.toString('binary'))) {
            throw new CorruptedFileError();
        }

        // 6. Extract text and parse Q/A pairs
        const text = extractFn(file.buffer);
        const pairs: Array<{ question: string; answer: string }> = [];
        const regex = /Q:\s*(.+?)\s*A:\s*(.+?)(?=\s*Q:|$)/gis;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text)) !== null) {
            pairs.push({ question: match[1].trim(), answer: match[2].trim() });
        }

        // 7. If no pairs found, throw InvalidFlashcardFormatError
        if (pairs.length === 0) {
            throw new InvalidFlashcardFormatError();
        }

        // 8. Delegate flashcard creation to FlashcardService
        const count = await FlashcardService.createBulk(collection, pairs);

        // 9. Return result
        return { count, message: `${count} flashcard(s) successfully imported.` };
    }

    async exportAsPdf(userID: number, collection: Collection): Promise<Buffer> {
        // 1. Fetch all flashcards via FlashcardService
        const flashcards = await FlashcardService.getAllByCollection(userID, collection);
        if (flashcards.length === 0) {
            throw new EmptyCollectionError();
        }

        // 2. Generate PDF buffer
        return new Promise<Buffer>((resolve, reject) => {
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: Buffer) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(20).text(collection.collectionName, { align: 'center' });
            doc.moveDown();

            flashcards.forEach((card, index) => {
                doc.fontSize(13).text(`Q${index + 1}: ${card.question}`);
                doc.fontSize(11).text(`A: ${card.answer}`);
                doc.moveDown();
            });

            doc.end();
        });
    }
}

export default new CollectionService();
