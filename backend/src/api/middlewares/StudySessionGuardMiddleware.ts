import { Request, Response, NextFunction } from 'express';
import StudySessionRepository from '../repositories/StudySessionRepository';
import { AppError } from '../../errors';

// Block flashcard deletion if referenced by an active session.
// Block collection deletion while any active session exists for it.
// Applied per-route on DELETE (and other destructive) handlers.

class StudySessionGuardMiddleware {
    async noActiveSessionForCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // came from CollectionAccessMiddleware, so req.collection is guaranteed to be set and to be number
            const collectionID = req.collection!.collectionID;
            const active = await StudySessionRepository.hasActiveSessionForCollection(collectionID);
            if (active) {
                return next(new AppError('Cannot delete a collection while a study session is active.', 409));
            }
            next();
        } catch (err) {
            next(err);
        }
    }

    async noActiveSessionForFlashcard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const flashcardID = Number(req.params.flashcardId);
            const active = await StudySessionRepository.hasActiveSessionForFlashcard(flashcardID);
            if (active) {
                return next(new AppError('Cannot delete a flashcard while a study session is active.', 409));
            }
            next();
        } catch (err) {
            next(err);
        }
    }
}

export default new StudySessionGuardMiddleware();
