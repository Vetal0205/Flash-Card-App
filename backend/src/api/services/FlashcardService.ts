import FlashcardRepository from '../repositories/FlashcardRepository';
import CollectionRepository from '../repositories/CollectionRepository';

// Business logic for individual flashcards
// FR-31: create manually; 
// FR-08: save; 
// FR-03: duplicate; 
// FR-11: flag as difficult
// FR-02: search; 
// FR-06: flip (handled client-side, data served here)

class FlashcardService {
    async getAllByCollection() {
        throw new Error('Not implemented');
    }

    async getFlagged() {
        throw new Error('Not implemented');
    }

    async search() {
        throw new Error('Not implemented');
    }

    async create() {
        throw new Error('Not implemented');
    }

    async update() {
        throw new Error('Not implemented');
    }

    async duplicate() {
        throw new Error('Not implemented');
    }

    async toggleFlag() {
        throw new Error('Not implemented');
    }

    async updateProgress() {
        throw new Error('Not implemented');
    }

    async delete() {
        throw new Error('Not implemented');
    }
}

export default new FlashcardService();
