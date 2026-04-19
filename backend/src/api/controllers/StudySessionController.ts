import { Request, Response, NextFunction } from 'express';
import StudySessionService from '../services/StudySessionService';

// Handles HTTP for: /api/v1/collections/:collectionId/study-sessions[/:sessionId]
// Use Cases 4 (random study + self-grade), 9 (pause/resume)

class StudySessionController {
    async start(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async getActive(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async pause(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async resume(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async recordAnswer(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async complete(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async getSummary(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }
}

export default new StudySessionController();
