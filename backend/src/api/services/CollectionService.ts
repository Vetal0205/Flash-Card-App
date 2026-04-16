import Collection, { CollectionCreationAttributes, CollectionUpdateAttributes } from '../models/Collection';
import CollectionRepository from '../repositories/CollectionRepository';
import FlashcardService from './FlashcardService';
import { Express } from 'express';
import {
    AppError,
    ValidationError,
} from '../../errors';
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

export interface ShareCollectionResult {
    shared: boolean;
    message: string;
    collection: Collection | null;
}

class CollectionService {
    // Centralized collection existence check used by authz helpers.
    private async getCollectionOrThrow(collectionID: number): Promise<Collection> {
        const collection = await CollectionRepository.findCollectionById(collectionID);
        if (!collection) {
            throw new CollectionNotFoundError();
        }
        return collection;
    }

    private async ensureCanReadCollection(userID: number, collectionID: number): Promise<Collection> {
        const collection = await this.getCollectionOrThrow(collectionID);
        if (collection.visibility !== 'public' && collection.userID !== userID) {
            throw new AppError('You can only access public collections or your own collections.', 403);
        }
        return collection;
    }

    private async ensureOwnsCollection(userID: number, collectionID: number): Promise<Collection> {
        const collection = await this.getCollectionOrThrow(collectionID);
        if (collection.userID !== userID) {
            throw new AppError('You can only modify collections you own.', 403);
        }
        return collection;
    }

    async getAllCollectionsByUser(userID: number): Promise<Collection[]> {
        // FR-07: list collections for authenticated user.
        return CollectionRepository.findAllCollectionsByUser(userID);
    }

    async create(data: CollectionCreationAttributes): Promise<Collection> {
        // FR-12: create new collection.
        if (!data.collectionName?.trim()) {
            throw new ValidationError('Collection name is required.');
        }

        return CollectionRepository.createCollection({
            ...data,
            collectionName: data.collectionName.trim(),
        });
    }

    async rename(collectionID: number, collectionName: string, userID: number): Promise<void> {
        await this.ensureOwnsCollection(userID, collectionID);

        // FR-18: rename collection.
        if (!collectionName?.trim()) {
            throw new ValidationError('Collection name is required.');
        }

        await CollectionRepository.updateCollection(collectionID, { collectionName: collectionName.trim() });
    }

    async update(collectionID: number, data: CollectionUpdateAttributes, userID: number): Promise<void> {
        await this.ensureOwnsCollection(userID, collectionID);
        await CollectionRepository.updateCollection(collectionID, data);
    }

    async delete(userID: number, collectionID: number): Promise<void> {
        // FR-13: owner-only collection deletion.
        await this.ensureOwnsCollection(userID, collectionID);
        await CollectionRepository.deleteCollectionById(collectionID);
    }

    async share(userID: number, collectionID: number): Promise<ShareCollectionResult> {
        // FR-04: frontend confirms; backend performs owner-only share action.
        const collection = await this.ensureOwnsCollection(userID, collectionID);

        if (collection.visibility !== 'public') {
            await CollectionRepository.updateCollection(collectionID, { visibility: 'public' });
            collection.visibility = 'public';
        }

        return {
            shared: true,
            message: 'Collection shared successfully.',
            collection,
        };
    }

    async importFromFile(
        collectionId: number,
        file: Express.Multer.File | undefined,
        userID?: number
    ): Promise<ImportResult> {
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
        const count = await FlashcardService.createBulk(collectionId, pairs);

        // 9. Return result
        return { count, message: `${count} flashcard(s) successfully imported.` };
    }

    async exportAsPdf(collectionId: number): Promise<Buffer> {
        // 1. Look up collection, throw 404 if not found
        const collection = await CollectionRepository.findCollectionById(collectionId);
        if (!collection) {
            throw new CollectionNotFoundError();
        }

        // 2. Fetch all flashcards via FlashcardService
        const flashcards = await FlashcardService.getAllByCollection(collectionId);
        if (flashcards.length === 0) {
            throw new EmptyCollectionError();
        }

        // 3. Generate PDF buffer
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
