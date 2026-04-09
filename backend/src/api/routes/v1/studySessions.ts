import { Router } from 'express';
import StudySessionController from '../../controllers/StudySessionController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';

const router: Router = Router();
router.use(AuthMiddleware.authenticate.bind(AuthMiddleware));


// UC-4:  POST  /api/v1/study-sessions          (start new session, collectionId in body)
router.post('/', StudySessionController.start.bind(StudySessionController));

// UC-9:  GET   /api/v1/study-sessions/active   (resume support — FR-19)
router.get('/active', StudySessionController.getActive.bind(StudySessionController));

// GET   /api/v1/study-sessions/:id
router.get('/:id', StudySessionController.getById.bind(StudySessionController));

// UC-9:  PATCH /api/v1/study-sessions/:id/pause
router.patch('/:id/pause', StudySessionController.pause.bind(StudySessionController));

// UC-9:  PATCH /api/v1/study-sessions/:id/resume
router.patch('/:id/resume', StudySessionController.resume.bind(StudySessionController));

// FR-16: POST  /api/v1/study-sessions/:id/answers
router.post('/:id/answers', StudySessionController.recordAnswer.bind(StudySessionController));

// UC-4:  PATCH /api/v1/study-sessions/:id/complete
router.patch('/:id/complete', StudySessionController.complete.bind(StudySessionController));

// FR-20: GET   /api/v1/study-sessions/:id/summary
router.get('/:id/summary', StudySessionController.getSummary.bind(StudySessionController));

export default router;
