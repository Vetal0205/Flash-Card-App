import { Request, Response, NextFunction } from 'express';
import FlashcardService from '../services/FlashcardService';

// Handles HTTP for: /collections/:collectionId/flashcards and /flashcards/:id
// Use Cases 4 (study/self-grade), 7 (difficult), 13 (search), 14 (create)

class FlashcardController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collectionID = Number(req.query.collectionId);
            if (!Number.isFinite(collectionID)) {
                throw new Error('collectionId query parameter is required.');
            }

            const flashcards = await FlashcardService.getAllByCollection(userID, collectionID);
            res.status(200).json(flashcards);
        } catch (err) {
            next(err);
        }
    }

    async getFlagged(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collectionID = Number(req.query.collectionId);
            if (!Number.isFinite(collectionID)) {
                throw new Error('collectionId query parameter is required.');
            }

            const flashcards = await FlashcardService.getFlagged(userID, collectionID);
            res.status(200).json(flashcards);
        } catch (err) {
            next(err);
        }
    }

    async search(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collectionID = Number(req.query.collectionId);
            if (!Number.isFinite(collectionID)) {
                throw new Error('collectionId query parameter is required.');
            }

            const keyword = String(req.query.q ?? '');
            const flashcards = await FlashcardService.search(userID, collectionID, keyword);
            res.status(200).json(flashcards);
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collectionID = Number(req.body.collectionID ?? req.body.collectionId);
            if (!Number.isFinite(collectionID)) {
                throw new Error('collectionID is required.');
            }

            const { question, answer } = req.body;
            const flashcard = await FlashcardService.create(userID, { collectionID, question, answer });
            res.status(201).json(flashcard);
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const flashcardID = Number(req.params.id);
            await FlashcardService.update(userID, flashcardID, req.body);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async duplicate(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const flashcardID = Number(req.params.id);
            const duplicated = await FlashcardService.duplicate(userID, flashcardID);
            res.status(201).json(duplicated);
        } catch (err) {
            next(err);
        }
    }

    async toggleFlag(req: Request, res: Response, next: NextFunction) { 
        try {
            const userID = (req as any).userdata?.userID;
            const flashcardID = Number(req.params.id);
            await FlashcardService.toggleFlag(userID, flashcardID);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const flashcardID = Number(req.params.id);
            await FlashcardService.delete(userID, flashcardID);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default new FlashcardController();
