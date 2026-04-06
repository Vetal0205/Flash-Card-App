import StudySession, { StudySessionCreationAttributes, StudySessionUpdateAttributes } from '../models/StudySession';
import StudySessionCardOrder, { StudySessionCardOrderCreationAttributes } from '../models/StudySessionCardOrder';
import StudySessionResponse, { StudySessionResponseCreationAttributes } from '../models/StudySessionResponse';

// Data access for StudySession, StudySessionResponse, StudySessionCardOrder
// Called by: StudySessionService
// FR-19: pause/resume; 
// FR-20: summary; 
// NFR-05/06: restore within 2s with 99% reliability

class StudySessionRepository {
    // TODO: implement each method

    async createSession(data: StudySessionCreationAttributes): Promise<StudySession> {
        throw new Error('Not implemented');
    }

    async findActiveSessionByUser(userID: number): Promise<StudySession | null> {
        throw new Error('Not implemented');
    }

    async findSessionById(id: number): Promise<StudySession | null> {
        throw new Error('Not implemented');
    }

    // Covers pause (status/pausedAt), resume (status/pausedAt), complete (status/completedAt/durationSeconds)
    async updateSession(id: number, data: StudySessionUpdateAttributes): Promise<void> {
        throw new Error('Not implemented');
    }

    // Bulk-inserts the randomized card order when a session starts (FR-10)
    async createCardOrder(cards: StudySessionCardOrderCreationAttributes[]): Promise<void> {
        throw new Error('Not implemented');
    }

    // Retrieves card order for session restore (NFR-05/06)
    async getCardOrder(sessionID: number): Promise<StudySessionCardOrder[]> {
        throw new Error('Not implemented');
    }

    async recordAnswer(data: StudySessionResponseCreationAttributes): Promise<StudySessionResponse> {
        throw new Error('Not implemented');
    }

    async getSummary(sessionID: number): Promise<StudySessionResponse[]> {
        throw new Error('Not implemented');
    }
}

export default new StudySessionRepository();
