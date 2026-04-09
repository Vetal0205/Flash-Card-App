import { Router } from 'express';
import CollectionController from '../../controllers/CollectionController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';

// TODO: add multer middleware to importFile route (FR-01/22/23)

const router: Router = Router();
router.use(AuthMiddleware.authenticate.bind(AuthMiddleware));

// UC-3:  GET    /api/v1/collections
router.get('/', CollectionController.getAll.bind(CollectionController));

// UC-3:  POST   /api/v1/collections
router.post('/', CollectionController.create.bind(CollectionController));

// UC-8:  PATCH  /api/v1/collections/:id
router.patch('/:id', CollectionController.rename.bind(CollectionController));

// UC-5:  DELETE /api/v1/collections/:id
router.delete('/:id', CollectionController.delete.bind(CollectionController));

// UC-16: POST   /api/v1/collections/:id/share
router.post('/:id/share', CollectionController.share.bind(CollectionController));

// UC-10: POST   /api/v1/collections/:id/import  (multipart/form-data)
router.post('/:id/import', CollectionController.importFile.bind(CollectionController));

// UC-11: GET    /api/v1/collections/:id/export
router.get('/:id/export', CollectionController.exportPdf.bind(CollectionController));

export default router;
