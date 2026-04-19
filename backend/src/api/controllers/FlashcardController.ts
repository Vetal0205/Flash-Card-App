import { Request, Response, NextFunction } from 'express';
import FlashcardService from '../services/FlashcardService';

// Handles HTTP for: /api/v1/collections/:collectionId/flashcards[/:flashcardId]
// Use Cases 4 (study/self-grade), 7 (difficult), 13 (search), 14 (create)
// Collection access is guaranteed by CollectionAccessMiddleware on the parent router.

class FlashcardController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const flashcards = await FlashcardService.getAllByCollection(req.userdata!.userID, req.collection!);
            res.status(200).json(flashcards);
        } catch (err) {
            next(err);
        }
    }

    async getFlagged(req: Request, res: Response, next: NextFunction) {
        try {
            const flashcards = await FlashcardService.getFlagged(req.userdata!.userID, req.collection!);
            res.status(200).json(flashcards);
        } catch (err) {
            next(err);
        }
    }

    async search(req: Request, res: Response, next: NextFunction) {
        try {
            const keyword = String(req.query.q ?? '');
            const flashcards = await FlashcardService.search(req.userdata!.userID, req.collection!, keyword);
            res.status(200).json(flashcards);
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { question, answer } = req.body;
            const flashcard = await FlashcardService.create(req.userdata!.userID, req.collection!, { question, answer });
            res.status(201).json(flashcard);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const flashcardID = Number(req.params.flashcardId);
            await FlashcardService.update(req.userdata!.userID, req.collection!, flashcardID, req.body);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async duplicate(req: Request, res: Response, next: NextFunction) {
        try {
            const flashcardID = Number(req.params.flashcardId);
            const duplicated = await FlashcardService.duplicate(req.userdata!.userID, req.collection!, flashcardID);
            res.status(201).json(duplicated);
        } catch (err) {
            next(err);
        }
    }

    async toggleFlag(req: Request, res: Response, next: NextFunction) {
        try {
            const flashcardID = Number(req.params.flashcardId);
            await FlashcardService.toggleFlag(req.userdata!.userID, req.collection!, flashcardID);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const flashcardID = Number(req.params.flashcardId);
            await FlashcardService.delete(req.userdata!.userID, req.collection!, flashcardID);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default new FlashcardController();
