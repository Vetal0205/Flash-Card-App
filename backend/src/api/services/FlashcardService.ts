import FlashcardRepository from '../repositories/FlashcardRepository';
import CollectionRepository from '../repositories/CollectionRepository';
import Flashcard, { FlashcardCreationAttributes, FlashcardUpdateAttributes } from '../models/Flashcard';
import { UserFlashcardProgressUpdateAttributes } from '../models/UserFlashcardProgress';

// Business logic for individual flashcards
// FR-31: create manually;
// FR-08: save;
// FR-03: duplicate;
// FR-11: flag as difficult
// FR-02: search;
// FR-06: flip (handled client-side, data served here)

class FlashcardService {
    async createBulk(
        collectionId: number,
        cards: Array<{ question: string; answer: string }>
    ): Promise<number> {
        // 1. For each card call FlashcardRepository.createFlashcard({ collectionID: collectionId, question, answer })
        // 2. Return the count of successfully created flashcards
        throw new Error('Not implemented');
    }

    async getAllByCollection() {
        throw new Error('Not implemented');
    }

    async getAllByCollection(collectionID: number): Promise<Flashcard[]> {
        throw new Error('Not implemented');
    }

    async getFlagged(userID: number, collectionID: number): Promise<Flashcard[]> {
        throw new Error('Not implemented');
    }

    async search(collectionID: number, keyword: string): Promise<Flashcard[]> {
        throw new Error('Not implemented');
    }

    async create(data: FlashcardCreationAttributes): Promise<Flashcard> {
        throw new Error('Not implemented');
    }

    async update(flashcardID: number, data: FlashcardUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async duplicate(flashcardID: number): Promise<Flashcard> {
        throw new Error('Not implemented');
    }

    async toggleFlag(userID: number, flashcardID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async updateProgress(userID: number, flashcardID: number, data: UserFlashcardProgressUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async delete(flashcardID: number): Promise<void> {
        throw new Error('Not implemented');
    }
}

export default new FlashcardService();
