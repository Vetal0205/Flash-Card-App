import { Request, Response, NextFunction } from 'express';
import CollectionService from '../services/CollectionService';
import { isServiceError } from '../services/ServiceError';

// Handles HTTP for: /collections and /collections/:id
// Use Cases 3 (create), 5 (delete), 8 (rename), 10 (import), 11 (export), 16 (share)

class CollectionController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async create(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async rename(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async share(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required.' });
                return;
            }

            const collectionIdParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const collectionID = Number.parseInt(collectionIdParam, 10);

            if (!Number.isInteger(collectionID) || collectionID <= 0) {
                res.status(400).json({ message: 'A valid collection id is required.' });
                return;
            }

            const { collection, alreadyShared } = await CollectionService.share(req.user.userID, collectionID);

            res.status(200).json({
                message: alreadyShared
                    ? 'Collection is already shared publicly.'
                    : 'Collection shared successfully.',
                collection,
            });
        } catch (error) {
            if (isServiceError(error)) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }

            if (error instanceof Error) {
                res.status(500).json({ message: error.message || 'Internal server error.' });
                return;
            }

            res.status(500).json({ message: 'Internal server error.' });
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
