import { Router } from 'express';
import { body, param, query } from 'express-validator';
import FlashcardController from '../../controllers/FlashcardController';
import { validate } from '../../middlewares/validator';

// Mounted at /collections/:collectionId/flashcards — collection context and access
// control are handled by the parent collections router (AuthMiddleware + CollectionAccessMiddleware).
// mergeParams exposes the parent :collectionId to this router and its controllers.

const router: Router = Router({ mergeParams: true });

const flashcardIdParam = param('flashcardId')
    .isInt({ min: 1 })
    .withMessage('flashcardId must be a positive integer.');

// UC-14: POST   /api/v1/collections/:collectionId/flashcards
router.post(
    '/',
    body('question').notEmpty().withMessage('Question is required.'),
    body('answer').notEmpty().withMessage('Answer is required.'),
    validate,
    FlashcardController.create.bind(FlashcardController)
);

// FR-07: GET    /api/v1/collections/:collectionId/flashcards
router.get('/', FlashcardController.getAll.bind(FlashcardController));

// UC-7:  GET    /api/v1/collections/:collectionId/flashcards/flagged
router.get('/flagged', FlashcardController.getFlagged.bind(FlashcardController));

// UC-13: GET    /api/v1/collections/:collectionId/flashcards/search?q=
router.get(
    '/search',
    query('q').notEmpty().withMessage('Search query q is required.'),
    validate,
    FlashcardController.search.bind(FlashcardController)
);

// FR-08: PATCH  /api/v1/collections/:collectionId/flashcards/:flashcardId
router.patch(
    '/:flashcardId',
    flashcardIdParam,
    body('question').optional().notEmpty().withMessage('question must not be blank.'),
    body('answer').optional().notEmpty().withMessage('answer must not be blank.'),
    validate,
    FlashcardController.update.bind(FlashcardController)
);

// FR-03: POST   /api/v1/collections/:collectionId/flashcards/:flashcardId/duplicate
router.post(
    '/:flashcardId/duplicate',
    flashcardIdParam,
    validate,
    FlashcardController.duplicate.bind(FlashcardController)
);

// FR-11: PATCH  /api/v1/collections/:collectionId/flashcards/:flashcardId/flag
router.patch(
    '/:flashcardId/flag',
    flashcardIdParam,
    validate,
    FlashcardController.toggleFlag.bind(FlashcardController)
);

// DELETE /api/v1/collections/:collectionId/flashcards/:flashcardId
router.delete(
    '/:flashcardId',
    flashcardIdParam,
    validate,
    FlashcardController.delete.bind(FlashcardController)
);

export default router;
