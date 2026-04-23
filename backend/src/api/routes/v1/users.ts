import { Router } from 'express';
import { body } from 'express-validator';
import UserController from '../../controllers/UserController';
import AuthMiddleware from '../../middlewares/AuthMiddleware';
import { validate } from '../../middlewares/validator';

const router: Router = Router();
router.use(AuthMiddleware.authenticate.bind(AuthMiddleware));

// UC-6: GET /api/v1/users/me
router.get('/me', UserController.getProfile.bind(UserController));

// UC-6: PATCH /api/v1/users/me
router.patch(
    '/me',
    body().custom((_value, { req }) => {
        if (req.body.username === undefined && req.body.email === undefined) {
            throw new Error('At least one of username or email must be provided.');
        }
        return true;
    }),
    body('username').optional().notEmpty().isLength({ max: 32 }).withMessage('username must not be blank and must be at most 32 characters.'),
    body('email').optional().isEmail().withMessage('A valid email address is required.'),
    validate,
    UserController.updateProfile.bind(UserController)
);

// UC-6: PATCH /api/v1/users/me/password — FR-27
router.patch(
    '/me/password',
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
        .isLength({ min: 12 }).withMessage('Password must be at least 12 characters.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
        .matches(/[0-9]/).withMessage('Password must contain at least one digit.'),
    validate,
    UserController.changePassword.bind(UserController)
);

// UC-15: DELETE /api/v1/users/me
router.delete(
    '/me',
    body('password').notEmpty().withMessage('Incomplete Field'),
    validate,
    UserController.deleteAccount.bind(UserController)
);

export default router;
