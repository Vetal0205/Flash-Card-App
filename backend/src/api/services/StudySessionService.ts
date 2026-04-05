import StudySessionRepository from '../repositories/StudySessionRepository';
import FlashcardRepository from '../repositories/FlashcardRepository';
import { ANSWER } from '../../constants';

// Business logic for study sessions
// FR-10: randomized order; 
// FR-19: pause/resume (NFR-05/06)
// FR-16: record answer; 
// FR-17: update card counts; 
// FR-20: session summary

class StudySessionService {
    async start() {
        throw new Error('Not implemented');
    }

    async getActive() {
        throw new Error('Not implemented');
    }

    async getById() {
        throw new Error('Not implemented');
    }

    async pause() {
        throw new Error('Not implemented');
    }

    async resume() {
        throw new Error('Not implemented');
    }

    async recordAnswer() {
       
        throw new Error('Not implemented');
    }

    async complete() {
        throw new Error('Not implemented');
    }

    async update() {
        throw new Error('Not implemented');
    }

    async getSummary() {
        throw new Error('Not implemented');
    }
}

export default new StudySessionService();
