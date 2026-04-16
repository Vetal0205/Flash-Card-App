import FlashcardRepository from '../repositories/FlashcardRepository';
import Collection from '../models/Collection';
import Flashcard, { FlashcardCreationAttributes, FlashcardUpdateAttributes } from '../models/Flashcard';
import { UserFlashcardProgressUpdateAttributes } from '../models/UserFlashcardProgress';
import { AppError, CollectionNotFoundError, ValidationError } from '../../errors';

// Business logic for individual flashcards
// FR-31: create manually;
// FR-08: save;
// FR-03: duplicate;
// FR-11: flag as difficult
// FR-02: search;
// FR-06: flip (handled client-side, data served here)

class FlashcardService {
    // Collection existence + visibility/ownership checks live here (service layer authz).
    private async getCollectionOrThrow(collectionID: number): Promise<Collection> {
        const collection = await Collection.findByPk(collectionID);
        if (!collection) {
            throw new CollectionNotFoundError();
        }
        return collection;
    }

    private async ensureCanReadCollection(userID: number, collectionID: number): Promise<Collection> {
        const collection = await this.getCollectionOrThrow(collectionID);

        // Read policy: public OR owner.
        if (collection.visibility !== 'public' && collection.userID !== userID) {
            throw new AppError('You can only access flashcards in public collections or your own collections.', 403);
        }

        return collection;
    }

    private async ensureOwnsCollection(userID: number, collectionID: number): Promise<Collection> {
        const collection = await this.getCollectionOrThrow(collectionID);

        // Write policy: owner-only.
        if (collection.userID !== userID) {
            throw new AppError('You can only modify flashcards in your own collections.', 403);
        }

        return collection;
    }

    async createBulk(
        collectionId: number,
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
                collectionID: collectionId,
                question,
                answer,
            });
            createdCount += 1;
        }

        return createdCount;
    }

    async getAllByCollection(userID: number, collectionID: number): Promise<Flashcard[]> {
        // FR-07: allow listing flashcards if collection is public or owned by user.
        await this.ensureCanReadCollection(userID, collectionID);

        return FlashcardRepository.findAllFlashcardsByCollection(collectionID);
    }

    async getFlagged(userID: number, collectionID: number): Promise<Flashcard[]> {
        await this.ensureCanReadCollection(userID, collectionID);

        // FR-11: difficult flag is per-user, so query by user + collection.
        return FlashcardRepository.findFlaggedByUserAndCollectionn(userID, collectionID);
    }

    async search(userID: number, collectionID: number, keyword: string): Promise<Flashcard[]> {
        // FR-02: allow search if collection is public or owned by user.
        await this.ensureCanReadCollection(userID, collectionID);

        // FR-02: search in question/answer text.
        const trimmedKeyword = keyword.trim();
        if (!trimmedKeyword) {
            return [];
        }

        return FlashcardRepository.searchFlashcardsByKeyword(collectionID, trimmedKeyword);
    }

    async create(userID: number, data: FlashcardCreationAttributes): Promise<Flashcard> {
        // FR-31: manual flashcard creation requires an existing collection.
        await this.ensureOwnsCollection(userID, data.collectionID);

        if (!data.question?.trim() || !data.answer?.trim()) {
            throw new ValidationError('Question and answer are required.');
        }

        return FlashcardRepository.createFlashcard({
            ...data,
            question: data.question.trim(),
            answer: data.answer.trim(),
        });
    }

    async update(userID: number, flashcardID: number, data: FlashcardUpdateAttributes): Promise<void> {
        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        // FR-08: only owner can update.
        await this.ensureOwnsCollection(userID, flashcard.collectionID);

        // FR-08: persist flashcard updates.
        await FlashcardRepository.updateFlashcard(flashcardID, data);
    }

    async duplicate(userID: number, flashcardID: number): Promise<Flashcard> {
        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        // FR-03: only owner can duplicate.
        await this.ensureOwnsCollection(userID, flashcard.collectionID);

        // FR-03: duplicate a flashcard in the same collection.
        return FlashcardRepository.createFlashcard({
            collectionID: flashcard.collectionID,
            question: flashcard.question,
            answer: flashcard.answer,
        });
    }

    async toggleFlag(userID: number, flashcardID: number): Promise<void> {
        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        // FR-11: only owner can modify difficult flags.
        await this.ensureOwnsCollection(userID, flashcard.collectionID);

        // FR-11: toggle per-user difficult flag.
        const progress = await FlashcardRepository.createFlashcardProgress({
            userID,
            flashcardID,
        });

        await FlashcardRepository.updateFlashcardProgress(userID, flashcardID, {
            isFlaggedDifficult: !progress.isFlaggedDifficult,
        });
    }

    async updateProgress(userID: number, flashcardID: number, data: UserFlashcardProgressUpdateAttributes): Promise<void> {
        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        await this.ensureOwnsCollection(userID, flashcard.collectionID);

        await FlashcardRepository.createFlashcardProgress({ userID, flashcardID });
        await FlashcardRepository.updateFlashcardProgress(userID, flashcardID, data);
    }

    async delete(userID: number, flashcardID: number): Promise<void> {
        const flashcard = await FlashcardRepository.findFlashcardById(flashcardID);
        if (!flashcard) {
            throw new AppError('Flashcard not found.', 404);
        }

        // FR-13: only owner can delete.
        await this.ensureOwnsCollection(userID, flashcard.collectionID);

        await FlashcardRepository.deleteFlashcardById(flashcardID);
    }
}

export default new FlashcardService();
