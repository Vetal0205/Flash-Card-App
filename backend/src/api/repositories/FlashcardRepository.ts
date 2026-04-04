import Flashcard, { FlashcardCreationAttributes, FlashcardUpdateAttributes } from '../models/Flashcard';
import UserFlashcardProgress, { UserFlashcardProgressCreationAttributes, UserFlashcardProgressUpdateAttributes } from '../models/UserFlashcardProgress';

// Data access for Flashcard and UserFlashcardProgress models
// Called by: FlashcardService
// FR-31: create;
// FR-08: update;
// FR-03: duplicate;
// FR-11: flag;`
// FR-02: search by keyword

class FlashcardRepository {
    // TODO: implement each method

    async findAllFlashcardsByCollection(collectionID: number): Promise<Flashcard[]> {
        throw new Error('Not implemented');
    }

    // isFlaggedDifficult is per-user (UserFlashcardProgress), so userID is required
    async findFlaggedByUserAndCollectionn(userID: number, collectionID: number): Promise<Flashcard[]> {
        throw new Error('Not implemented');
    }

    async searchFlashcardsByKeyword(collectionID: number, keyword: string): Promise<Flashcard[]> {
        throw new Error('Not implemented');
    }

    async findFlashcardById(id: number): Promise<Flashcard | null> {
        throw new Error('Not implemented');
    }

    async createFlashcard(data: FlashcardCreationAttributes): Promise<Flashcard> {
        throw new Error('Not implemented');
    }

    async updateFlashcard(id: number, data: FlashcardUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    // Creates initial UserFlashcardProgress row when a user first encounters a flashcard
    async createFlashcardProgress(data: UserFlashcardProgressCreationAttributes): Promise<UserFlashcardProgress> {
        throw new Error('Not implemented');
    }

    async updateFlashcardProgress(userID: number, flashcardID: number, data: UserFlashcardProgressUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async deleteFlashcardById(id: number): Promise<void> {
        throw new Error('Not implemented');
    }
}

export default new FlashcardRepository();
