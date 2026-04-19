import StudySessionRepository from '../repositories/StudySessionRepository';
import FlashcardService from './FlashcardService';
import { AppError, ForbiddenError } from '../../errors';
import Collection from '../models/Collection';
import StudySession, { StudySessionUpdateAttributes } from '../models/StudySession';

// Business logic for study sessions
// FR-10: randomized order with flagged cards distributed proportionally
// FR-19: pause/resume duration accumulation (NFR-05/06)
// FR-16: record answer; FR-17: update card progress counts
// FR-20: session summary

function shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Interleaves flagged IDs evenly among regular IDs for proportional distribution (FR-10).
function distributeProportionally(regular: number[], flagged: number[]): number[] {
    if (flagged.length === 0) return regular;
    const result: number[] = [];
    const step = regular.length > 0 ? Math.ceil(regular.length / (flagged.length + 1)) : 0;
    let ri = 0;
    for (let fi = 0; fi < flagged.length; fi++) {
        const end = Math.min(ri + step, regular.length);
        while (ri < end) result.push(regular[ri++]);
        result.push(flagged[fi]);
    }
    while (ri < regular.length) result.push(regular[ri++]);
    return result;
}

class StudySessionService {
    async start(userID: number, collection: Collection): Promise<{ session: StudySession; cardOrder: number[] }> {
        if (collection.userID !== userID) throw new ForbiddenError();

        const existing = await StudySessionRepository.findActiveSessionByCollection(userID, collection.collectionID);
        if (existing) {
            if (existing.status === 'paused') {
                await this.resume(existing);
                await existing.reload();
            }
            const rows = await StudySessionRepository.getCardOrder(existing.sessionID);
            return { session: existing, cardOrder: rows.map(r => r.flashcardID) };
        }

        const allCards = await FlashcardService.getAllByCollection(userID, collection);
        const flagged  = await FlashcardService.getFlagged(userID, collection);

        const flaggedIds = new Set(flagged.map((f: any) => f.flashcardID));
        const regularIds = shuffle(allCards.filter((f: any) => !flaggedIds.has(f.flashcardID)).map((f: any) => f.flashcardID));
        const flaggedIdsList = shuffle(flagged.map((f: any) => f.flashcardID));
        const cardOrder = distributeProportionally(regularIds, flaggedIdsList);

        const session = await StudySessionRepository.createSession({ userID, collectionID: collection.collectionID });
        await StudySessionRepository.createCardOrder(
            cardOrder.map((flashcardID, i) => ({ sessionID: session.sessionID, sequenceNumber: i, flashcardID }))
        );

        return { session, cardOrder };
    }

    async getActive(userID: number, collection: Collection): Promise<StudySession | null> {
        return StudySessionRepository.findActiveSessionByCollection(userID, collection.collectionID);
    }

    async getById(sessionID: number): Promise<StudySession | null> {
        return StudySessionRepository.findSessionById(sessionID);
    }

    async pause(session: StudySession): Promise<void> {
        const now = new Date();
        const segmentStart = session.resumedAt ?? session.startedAt;
        const elapsed = Math.floor((now.getTime() - segmentStart.getTime()) / 1000);

        await this.update(session.sessionID, {
            status: 'paused',
            pausedAt: now,
            resumedAt: null,
            durationSeconds: session.durationSeconds + elapsed,
        });
    }

    async resume(session: StudySession): Promise<void> {
        await this.update(session.sessionID, {
            status: 'active',
            pausedAt: null,
            resumedAt: new Date(),
        });
    }

    async recordAnswer(
        session: StudySession,
        flashcardID: number,
        responseType: 'known' | 'unknown' | 'skipped'
    ): Promise<void> {
        await StudySessionRepository.recordAnswer({ sessionID: session.sessionID, flashcardID, responseType });

        if (responseType !== 'skipped') {
            await FlashcardService.findOrCreateProgress({ userID: session.userID, flashcardID });
            await FlashcardService.incrementProgress(session.userID, flashcardID, responseType === 'known' ? 'knownCount' : 'unknownCount');
            await this.update(session.sessionID, { currentIndex: session.currentIndex + 1 });
        }
    }

    async complete(session: StudySession): Promise<void> {
        const now = new Date();
        const segmentStart = session.resumedAt ?? session.startedAt;
        const elapsed = Math.floor((now.getTime() - segmentStart.getTime()) / 1000);

        await this.update(session.sessionID, {
            status: 'completed',
            completedAt: now,
            durationSeconds: session.durationSeconds + elapsed,
        });
    }

    async update(sessionID: number, data: StudySessionUpdateAttributes): Promise<void> {
        await StudySessionRepository.updateSession(sessionID, data);
    }

    async getSummary(session: StudySession): Promise<{ known: number; unknown: number; skipped: number }> {
        const rows = await StudySessionRepository.getSummary(session.sessionID);
        return rows.reduce(
            (acc: { known: number; unknown: number; skipped: number }, row: any) => {
                acc[row.responseType as 'known' | 'unknown' | 'skipped'] += 1;
                return acc;
            },
            { known: 0, unknown: 0, skipped: 0 }
        );
    }
}

export default new StudySessionService();
