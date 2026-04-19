import { Router } from 'express';
import { body } from 'express-validator';
import CollectionController from '../../controllers/CollectionController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';
import CollectionAccessMiddleware from '../../middlewares/CollectionAccessMiddleware';
import { validate } from '../../middlewares/validator';
import StudySessionGuardMiddleware from '../../middlewares/StudySessionGuardMiddleware';
import upload from '../../middlewares/upload';
import flashcardsRouter from './flashcards';
import studySessionsRouter from './studySessions';

const router: Router = Router();
router.use(AuthMiddleware.authenticate.bind(AuthMiddleware));
router.param('collectionId', CollectionAccessMiddleware.forCollection.bind(CollectionAccessMiddleware));

// UC-3:  GET    /api/v1/collections
router.get('/', CollectionController.getAll.bind(CollectionController));

// GET    /api/v1/collections/public?page=1&limit=30
router.get('/public', CollectionController.getPublic.bind(CollectionController));

// UC-3:  POST   /api/v1/collections
router.post(
    '/',
    body('collectionName').notEmpty().isLength({ max: 32 }).withMessage('Collection name is required and must be at most 32 characters.'),
    body('visibility').optional().isIn(['public', 'private']).withMessage("visibility must be 'public' or 'private'."),
    validate,
    CollectionController.create.bind(CollectionController)
);

// UC-8:  PATCH  /api/v1/collections/:collectionId
router.patch(
    '/:collectionId',
    body('collectionName').notEmpty().isLength({ max: 32 }).withMessage('Collection name is required and must be at most 32 characters.'),
    validate,
    CollectionController.rename.bind(CollectionController)
);

// UC-5:  DELETE /api/v1/collections/:collectionId
router.delete(
    '/:collectionId',
    StudySessionGuardMiddleware.noActiveSessionForCollection.bind(StudySessionGuardMiddleware),
    CollectionController.delete.bind(CollectionController)
);

// UC-16: POST   /api/v1/collections/:collectionId/share
router.post('/:collectionId/share', CollectionController.share.bind(CollectionController));

// UC-10: POST   /api/v1/collections/:collectionId/import  (multipart/form-data)
router.post('/:collectionId/import', upload.single('file'), CollectionController.importFile.bind(CollectionController));

// UC-11: GET    /api/v1/collections/:collectionId/export
router.get('/:collectionId/export', CollectionController.exportPdf.bind(CollectionController));

// Sub-resources — both inherit auth + access control from this router
router.use('/:collectionId/flashcards', flashcardsRouter);
router.use('/:collectionId/study-sessions', studySessionsRouter);

export default router;
