import { Op } from 'sequelize';
import StudySession, { StudySessionCreationAttributes, StudySessionUpdateAttributes } from '../models/StudySession';
import StudySessionCardOrder, { StudySessionCardOrderCreationAttributes } from '../models/StudySessionCardOrder';
import StudySessionResponse, { StudySessionResponseCreationAttributes } from '../models/StudySessionResponse';

// Data access for StudySession, StudySessionResponse, StudySessionCardOrder
// Called by: StudySessionService, StudySessionGuardMiddleware
// FR-19: pause/resume;
// FR-20: summary;
// NFR-05/06: restore within 2s with 99% reliability

class StudySessionRepository {
    async createSession(data: StudySessionCreationAttributes): Promise<StudySession> {
        return StudySession.create(data);
    }

    async findActiveSessionByCollection(userID: number, collectionID: number): Promise<StudySession | null> {
        return StudySession.findOne({
            where: { userID, collectionID, status: ['active', 'paused'] },
        });
    }

    async findSessionById(id: number): Promise<StudySession | null> {
        return StudySession.findByPk(id);
    }

    // Covers pause (status/pausedAt), resume (status/resumedAt), complete (status/completedAt/durationSeconds)
    async updateSession(id: number, data: StudySessionUpdateAttributes): Promise<void> {
        await StudySession.update(data, { where: { sessionID: id } });
    }

    // Bulk-inserts the randomized card order when a session starts (FR-10)
    async createCardOrder(cards: StudySessionCardOrderCreationAttributes[]): Promise<void> {
        await StudySessionCardOrder.bulkCreate(cards);
    }

    // Retrieves card order sorted by sequenceNumber for session restore (NFR-05/06)
    async getCardOrder(sessionID: number): Promise<StudySessionCardOrder[]> {
        return StudySessionCardOrder.findAll({
            where: { sessionID },
            order: [['sequenceNumber', 'ASC']],
        });
    }

    async recordAnswer(data: StudySessionResponseCreationAttributes): Promise<StudySessionResponse> {
        return StudySessionResponse.create(data);
    }

    async getSummary(sessionID: number): Promise<StudySessionResponse[]> {
        return StudySessionResponse.findAll({
            where: { sessionID },
        });
    }

    // async moveCardToEndOfOrder(sessionID: number, sequenceNumber: number): Promise<void> {}

    async hasActiveSessionForCollection(collectionID: number): Promise<boolean> {
        const count = await StudySession.count({
            where: { collectionID, status: ['active', 'paused'] },
        });
        return count > 0;
    }

    async hasActiveSessionForFlashcard(flashcardID: number): Promise<boolean> {
        const count = await StudySessionCardOrder.count({
            where: { flashcardID },
            include: [{
                model: StudySession,
                where: { status: ['active', 'paused'] },
                required: true,
            }],
        });
        return count > 0;
    }
}

export default new StudySessionRepository();
