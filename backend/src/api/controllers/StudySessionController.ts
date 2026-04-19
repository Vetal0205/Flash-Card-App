import { Request, Response, NextFunction } from 'express';
import StudySessionService from '../services/StudySessionService';

// Handles HTTP for: /api/v1/collections/:collectionId/study-sessions[/:sessionId]
// Use Cases 4 (random study + self-grade), 9 (pause/resume)
// Session ownership enforced by SessionAccessMiddleware — req.studySession is guaranteed on /:sessionId routes.

class StudySessionController {
    async start(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await StudySessionService.start(req.userdata!.userID, req.collection!);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    }

    async getActive(req: Request, res: Response, next: NextFunction) {
        try {
            const session = await StudySessionService.getActive(req.userdata!.userID, req.collection!);
            res.status(200).json(session);
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            res.status(200).json(req.studySession!);
        } catch (err) {
            next(err);
        }
    }

    async pause(req: Request, res: Response, next: NextFunction) {
        try {
            await StudySessionService.pause(req.studySession!);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async resume(req: Request, res: Response, next: NextFunction) {
        try {
            await StudySessionService.resume(req.studySession!);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async recordAnswer(req: Request, res: Response, next: NextFunction) {
        try {
            const { flashcardID, responseType } = req.body;
            await StudySessionService.recordAnswer(req.studySession!, Number(flashcardID), responseType);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async complete(req: Request, res: Response, next: NextFunction) {
        try {
            await StudySessionService.complete(req.studySession!);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async getSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const summary = await StudySessionService.getSummary(req.studySession!);
            res.status(200).json(summary);
        } catch (err) {
            next(err);
        }
    }
}

export default new StudySessionController();
