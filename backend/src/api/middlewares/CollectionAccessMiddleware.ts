import { Request, Response, NextFunction } from 'express';

import Collection from '../models/Collection';
import { BadRequestError, CollectionNotFoundError, ForbiddenError } from '../../errors';

// UC-3/5/8/10/11/16: Gate access to a specific collection.
// A collection is accessible when the requesting user is its owner OR it is public.
//
// Must run AFTER AuthMiddleware (relies on req.userdata being populated).
// On success attaches the resolved Collection instance to req.collection so that
// downstream controllers and sub-routers do not need to re-fetch it.
//
// Applied once per router group via router.use().
// Routes without :collectionId (GET / list, POST / create) are passed through automatically.

class CollectionAccessMiddleware {
    async forCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
        const rawId = req.params.collectionId;
        if (!rawId) {
            return next();
        }

        const collectionId = parseInt(String(rawId), 10);
        if (isNaN(collectionId)) {
            return next(new BadRequestError('collectionId must be a positive integer.'));
        }

        try {
            const collection = await Collection.findByPk(collectionId);

            if (!collection) {
                return next(new CollectionNotFoundError());
            }

            const isOwner = req.userdata?.userID === collection.userID;
            const isPublic = collection.visibility === 'public';

            if (!isOwner && !isPublic) {
                return next(new ForbiddenError());
            }

            req.collection = collection;
            next();
        } catch (err) {
            next(err);
        }
    }
}

export default new CollectionAccessMiddleware();
