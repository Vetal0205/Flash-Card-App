import { Request, Response, NextFunction } from 'express';
import CollectionService from '../services/CollectionService';

// Handles HTTP for: /collections and /collections/:id
// Use Cases 3 (create), 5 (delete), 8 (rename), 10 (import), 11 (export), 16 (share)

class CollectionController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collections = await CollectionService.getAllCollectionsByUser(userID);
            res.status(200).json(collections);
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const { collectionName, description, visibility } = req.body;

            // FR-12: create collection in authenticated user's scope.
            const collection = await CollectionService.create({
                userID,
                collectionName,
                description,
                visibility,
            });

            res.status(201).json(collection);
        } catch (err) {
            next(err);
        }
    }

    async rename(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collectionID = Number(req.params.id);
            const { collectionName } = req.body;

            await CollectionService.rename(collectionID, collectionName, userID);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collectionID = Number(req.params.id);

            await CollectionService.delete(userID, collectionID);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async share(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const collectionID = Number(req.params.id);

            // FR-04: frontend confirms action; backend executes share.
            const result = await CollectionService.share(userID, collectionID);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async importFile(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async exportPdf(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }
}

export default new CollectionController();
