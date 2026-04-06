import StudySessionRepository from '../repositories/StudySessionRepository';
import FlashcardRepository from '../repositories/FlashcardRepository';
import { ANSWER } from '../../constants';
import StudySession, { StudySessionUpdateAttributes } from '../models/StudySession';
import StudySessionResponse from '../models/StudySessionResponse';

// Business logic for study sessions
// FR-10: randomized order;
// FR-19: pause/resume (NFR-05/06)
// FR-16: record answer;
// FR-17: update card counts;
// FR-20: session summary

class StudySessionService {
    async start(userID: number, collectionID: number): Promise<StudySession> {
        throw new Error('Not implemented');
    }

    async getActive(userID: number): Promise<StudySession | null> {
        throw new Error('Not implemented');
    }

    async getById(sessionID: number): Promise<StudySession | null> {
        throw new Error('Not implemented');
    }

    async pause(sessionID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async resume(sessionID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async recordAnswer(
        sessionID: number,
        flashcardID: number,
        responseType: 'known' | 'unknown' | 'skipped'
    ): Promise<void> {
        throw new Error('Not implemented');
    }

    async complete(sessionID: number): Promise<void> {
        throw new Error('Not implemented');
    }

    async update(sessionID: number, data: StudySessionUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    async getSummary(sessionID: number): Promise<StudySessionResponse[]> {
        throw new Error('Not implemented');
    }
}

export default new StudySessionService();
