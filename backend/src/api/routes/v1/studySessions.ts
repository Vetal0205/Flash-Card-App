import { Router } from 'express';
import { body, param } from 'express-validator';
import StudySessionController from '../../controllers/StudySessionController';
import SessionAccessMiddleware from '../../middlewares/SessionAccessMiddleware';
import { validate } from '../../middlewares/validator';

// Mounted at /collections/:collectionId/study-sessions — collection context and access
// control are handled by the parent collections router (AuthMiddleware + CollectionAccessMiddleware).
// mergeParams exposes the parent :collectionId to this router and its controllers.

const router: Router = Router({ mergeParams: true });

router.param('sessionId', SessionAccessMiddleware.forSession.bind(SessionAccessMiddleware));

const sessionIdParam = param('sessionId')
    .isInt({ min: 1 })
    .withMessage('sessionId must be a positive integer.');

const sessionAccess = [
    sessionIdParam,
    validate,
];

// UC-4:  POST  /api/v1/collections/:collectionId/study-sessions
router.post('/', StudySessionController.start.bind(StudySessionController));

// UC-9:  GET   /api/v1/collections/:collectionId/study-sessions/active
router.get('/active', StudySessionController.getActive.bind(StudySessionController));

// GET   /api/v1/collections/:collectionId/study-sessions/:sessionId
router.get('/:sessionId', ...sessionAccess, StudySessionController.getById.bind(StudySessionController));

// UC-9:  PATCH /api/v1/collections/:collectionId/study-sessions/:sessionId/pause
router.patch('/:sessionId/pause', ...sessionAccess, StudySessionController.pause.bind(StudySessionController));

// UC-9:  PATCH /api/v1/collections/:collectionId/study-sessions/:sessionId/resume
router.patch('/:sessionId/resume', ...sessionAccess, StudySessionController.resume.bind(StudySessionController));

// FR-16: POST  /api/v1/collections/:collectionId/study-sessions/:sessionId/answers
router.post(
    '/:sessionId/answers',
    ...sessionAccess,
    body('flashcardID').isInt({ min: 1 }).withMessage('flashcardID must be a positive integer.'),
    body('responseType').isIn(['known', 'unknown', 'skipped']).withMessage("responseType must be 'known', 'unknown', or 'skipped'."),
    validate,
    StudySessionController.recordAnswer.bind(StudySessionController)
);

// UC-4:  PATCH /api/v1/collections/:collectionId/study-sessions/:sessionId/complete
router.patch('/:sessionId/complete', ...sessionAccess, StudySessionController.complete.bind(StudySessionController));

// FR-20: GET   /api/v1/collections/:collectionId/study-sessions/:sessionId/summary
router.get('/:sessionId/summary', ...sessionAccess, StudySessionController.getSummary.bind(StudySessionController));

export default router;
