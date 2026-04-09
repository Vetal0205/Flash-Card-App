import { Router } from 'express';
import FlashcardController from '../../controllers/FlashcardController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const router: Router = Router();
router.use(AuthMiddleware.authenticate.bind(AuthMiddleware));


// UC-14: POST   /api/v1/flashcards  (create in a collection, collectionId in body)
router.post('/', FlashcardController.create.bind(FlashcardController));

// FR-07: GET    /api/v1/flashcards?collectionId=&flagged=&q=
router.get('/', FlashcardController.getAll.bind(FlashcardController));

// UC-7:  GET    /api/v1/flashcards/flagged?collectionId=
router.get('/flagged', FlashcardController.getFlagged.bind(FlashcardController));

// UC-13: GET    /api/v1/flashcards/search?collectionId=&q=
router.get('/search', FlashcardController.search.bind(FlashcardController));

// FR-08: PATCH  /api/v1/flashcards/:id
router.patch('/:id', FlashcardController.update.bind(FlashcardController));

// FR-03: POST   /api/v1/flashcards/:id/duplicate
router.post('/:id/duplicate', FlashcardController.duplicate.bind(FlashcardController));

// FR-11: PATCH  /api/v1/flashcards/:id/flag
router.patch('/:id/flag', FlashcardController.toggleFlag.bind(FlashcardController));

// DELETE /api/v1/flashcards/:id
router.delete('/:id', FlashcardController.delete.bind(FlashcardController));

export default router;
