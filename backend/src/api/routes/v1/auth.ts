import { Router } from 'express';
import { body } from 'express-validator';
import AuthController from '../../controllers/AuthController';
import { validate } from '../../middlewares/validator';

const router: Router = Router();

// UC-1: POST /api/v1/auth/login — FR-28
router.post(
    '/login',
    body('credential').notEmpty().withMessage('Email or username is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    validate,
    AuthController.login
);

// UC-2: POST /api/v1/auth/register — FR-27
router.post(
    '/register',
    body('username').notEmpty().isLength({ max: 32 }).withMessage('Username is required and must be at most 32 characters.'),
    body('email').isEmail().withMessage('A valid email address is required.'),
    body('password')
        .isLength({ min: 12 }).withMessage('Password must be at least 12 characters.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
        .matches(/[0-9]/).withMessage('Password must contain at least one digit.'),
    validate,
    AuthController.register
);

// POST /api/v1/auth/logout
router.post('/logout', AuthController.logout);

export default router;
