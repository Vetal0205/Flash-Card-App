import { Request, Response, NextFunction } from 'express';
import CollectionService from '../services/CollectionService';

// Handles HTTP for: /collections and /collections/:collectionId
// Use Cases 3 (create), 5 (delete), 8 (rename), 10 (import), 11 (export), 16 (share)

class CollectionController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const collections = await CollectionService.getAllCollectionsByUser(req.userdata!.userID);
            res.status(200).json(collections);
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { collectionName, description, visibility } = req.body;

            // FR-12: create collection in authenticated user's scope.
            const collection = await CollectionService.create({
                userID: req.userdata!.userID,
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
            await CollectionService.rename(req.userdata!.userID, req.collection!, req.body.collectionName);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await CollectionService.delete(req.userdata!.userID, req.collection!);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async share(req: Request, res: Response, next: NextFunction) {
        try {
            // FR-04: frontend confirms action; backend executes share.
            const result = await CollectionService.share(req.userdata!.userID, req.collection!);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async importFile(req: Request, res: Response, next: NextFunction) {
        try {
            const file = req.file;
            const result = await CollectionService.importFromFile(req.userdata!.userID, req.collection!, file);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async exportPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const pdfBuffer = await CollectionService.exportAsPdf(req.userdata!.userID, req.collection!);
            res.setHeader('Content-Type', 'application/pdf');
            const safeName = req.collection!.collectionName.replace(/[^\w\s-]/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
            res.status(200).send(pdfBuffer);
        } catch (err) {
            next(err);
        }
    }
}

export default new CollectionController();
