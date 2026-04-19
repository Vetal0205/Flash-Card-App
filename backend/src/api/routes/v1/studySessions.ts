import { Router } from 'express';
import { param } from 'express-validator';
import StudySessionController from '../../controllers/StudySessionController';
import { validate } from '../../middlewares/validator';

// Mounted at /collections/:collectionId/study-sessions — collection context and access
// control are handled by the parent collections router (AuthMiddleware + CollectionAccessMiddleware).
// mergeParams exposes the parent :collectionId to this router and its controllers.

const router: Router = Router({ mergeParams: true });

const sessionIdParam = param('sessionId')
    .isInt({ min: 1 })
    .withMessage('sessionId must be a positive integer.');

// UC-4:  POST  /api/v1/collections/:collectionId/study-sessions
router.post('/', StudySessionController.start.bind(StudySessionController));

// UC-9:  GET   /api/v1/collections/:collectionId/study-sessions/active
router.get('/active', StudySessionController.getActive.bind(StudySessionController));

// GET   /api/v1/collections/:collectionId/study-sessions/:sessionId
router.get('/:sessionId', sessionIdParam, validate, StudySessionController.getById.bind(StudySessionController));

// UC-9:  PATCH /api/v1/collections/:collectionId/study-sessions/:sessionId/pause
router.patch('/:sessionId/pause', sessionIdParam, validate, StudySessionController.pause.bind(StudySessionController));

// UC-9:  PATCH /api/v1/collections/:collectionId/study-sessions/:sessionId/resume
router.patch('/:sessionId/resume', sessionIdParam, validate, StudySessionController.resume.bind(StudySessionController));

// FR-16: POST  /api/v1/collections/:collectionId/study-sessions/:sessionId/answers
router.post('/:sessionId/answers', sessionIdParam, validate, StudySessionController.recordAnswer.bind(StudySessionController));

// UC-4:  PATCH /api/v1/collections/:collectionId/study-sessions/:sessionId/complete
router.patch('/:sessionId/complete', sessionIdParam, validate, StudySessionController.complete.bind(StudySessionController));

// FR-20: GET   /api/v1/collections/:collectionId/study-sessions/:sessionId/summary
router.get('/:sessionId/summary', sessionIdParam, validate, StudySessionController.getSummary.bind(StudySessionController));

export default router;
