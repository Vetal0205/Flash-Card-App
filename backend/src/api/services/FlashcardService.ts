import FlashcardRepository from '../repositories/FlashcardRepository';
import Collection from '../models/Collection';
import Flashcard, { FlashcardCreationAttributes, FlashcardUpdateAttributes } from '../models/Flashcard';
import UserFlashcardProgress, { UserFlashcardProgressCreationAttributes, UserFlashcardProgressUpdateAttributes } from '../models/UserFlashcardProgress';
import { AppError, ForbiddenError } from '../../errors';

// Business logic for individual flashcards
// FR-31: create manually;
// FR-08: save;
// FR-03: duplicate;
// FR-11: flag as difficult
// FR-02: search;
// FR-06: flip (handled client-side, data served here)
//
// All public methods accept the pre-fetched Collection instance resolved by
// CollectionAccessMiddleware so the collection is never re-fetched from the DB.
// Access control (public vs. owner) is already verified by the middleware;
// write operations additionally enforce ownership inline.

class FlashcardService {
    private ensureOwns(userID: number, collection: Collection): void {
        if (collection.userID !== userID) {
            throw new ForbiddenError();
        }
    }

    async createBulk(
        collection: Collection,
        cards: Array<{ question: string; answer: string }>
    ): Promise<number> {
        let createdCount = 0;

        // FR-31: bulk-create flashcards from parsed import entries.
        for (const card of cards) {
            const question = card.question?.trim();
            const answer = card.answer?.trim();

            if (!question || !answer) {
                continue;
            }

            await FlashcardRepository.createFlashcard({
                collectionID: collection.collectionID,
                question,
                answer,
            });
            createdCount += 1;
        }

        return createdCount;
    }

    async getAllByCollection(userID: number, collection: Collection): Promise<Flashcard[]> {
        // Access already verified by middleware — fetch directly.
        return FlashcardRepository.findAllFlashcardsByCollection(collection.collectionID);
    }

    async getFlagged(userID: number, collection: Collection): Promise<Flashcard[]> {
        // FR-11: difficult flag is per-user, so query by user + collection.
        return FlashcardRepository.findFlaggedByUserAndCollectionn(userID, collection.collectionID);
    }

    async search(userID: number, collection: Collection, keyword: string): Promise<Flashcard[]> {
        // FR-02: search in question/answer text.
        const trimmedKeyword = keyword.trim();
        if (!trimmedKeyword) {
            return [];
        }

        return FlashcardRepository.searchFlashcardsByKeyword(collection.collectionID, trimmedKeyword);
    }

    async create(userID: number, collection: Collection, data: Omit<FlashcardCreationAttributes, 'collectionID'>): Promise<Flashcard> {
        // FR-31: manual flashcard creation requires ownership.
        this.ensureOwns(userID, collection);

        return FlashcardRepository.createFlashcard({
            collectionID: collection.collectionID,
            question: data.question.trim(),
            answer: data.answer.trim(),
        });
    }

    async update(userID: number, collection: Collection, flashcardID: number, data: FlashcardUpdateAttributes): Promise<void> {
        this.ensureOwns(userID, collection);

        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        // FR-08: persist flashcard updates.
        await FlashcardRepository.updateFlashcard(flashcardID, data);
    }

    async duplicate(userID: number, collection: Collection, flashcardID: number): Promise<Flashcard> {
        this.ensureOwns(userID, collection);

        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        // FR-03: duplicate a flashcard in the same collection.
        return FlashcardRepository.createFlashcard({
            collectionID: collection.collectionID,
            question: flashcard.question,
            answer: flashcard.answer,
        });
    }

    async findOrCreateProgress(data: UserFlashcardProgressCreationAttributes): Promise<UserFlashcardProgress> {
        return FlashcardRepository.findOrCreateFlashcardProgress(data);
    }

    async toggleFlag(userID: number, collection: Collection, flashcardID: number): Promise<void> {
        // FR-11: flag is per-user; any collection member can flag (read access sufficient).
        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        const progress = await this.findOrCreateProgress({ userID, flashcardID });

        await FlashcardRepository.updateFlashcardProgress(userID, flashcardID, {
            isFlaggedDifficult: !progress.isFlaggedDifficult,
        });
    }

    async updateProgress(userID: number, collection: Collection, flashcardID: number, data: UserFlashcardProgressUpdateAttributes): Promise<void> {
        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        await FlashcardRepository.updateFlashcardProgress(userID, flashcardID, data);
    }

    async incrementProgress(userID: number, flashcardID: number, field: 'knownCount' | 'unknownCount'): Promise<void> {
        await FlashcardRepository.incrementFlashcardProgress(userID, flashcardID, field);
    }

    async delete(userID: number, collection: Collection, flashcardID: number): Promise<void> {
        this.ensureOwns(userID, collection);

        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        // FR-13: only owner can delete.
        await FlashcardRepository.deleteFlashcardById(flashcardID);
    }
}

export default new FlashcardService();
