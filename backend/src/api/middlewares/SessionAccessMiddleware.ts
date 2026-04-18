import { Request, Response, NextFunction } from 'express';
import StudySession from '../models/StudySession';
import { AppError, BadRequestError, ForbiddenError } from '../../errors';

// Resolves :sessionId, verifies the session belongs to the requesting user,
// and attaches it to req.studySession for downstream handlers.
// Must run after AuthMiddleware (relies on req.userdata).

class SessionAccessMiddleware {
    async forSession(req: Request, res: Response, next: NextFunction, sessionId: string): Promise<void> {
        const id = parseInt(sessionId, 10);
        if (isNaN(id)) {
            return next(new BadRequestError('sessionId must be a positive integer.'));
        }

        try {
            const session = await StudySession.findByPk(id);
            if (!session) return next(new AppError('Session not found.', 404));
            if (session.userID !== req.userdata!.userID) return next(new ForbiddenError());

            req.studySession = session;
            next();
        } catch (err) {
            next(err);
        }
    }
}

export default new SessionAccessMiddleware();
