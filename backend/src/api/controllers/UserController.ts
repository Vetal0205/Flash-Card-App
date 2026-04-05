import { Request, Response, NextFunction } from 'express';
import UserService from '../services/UserService';
import { isServiceError } from '../services/ServiceError';

// Handles HTTP for: GET/PATCH /users/me, DELETE /users/me, PATCH /users/me/password
// Use Cases 6 (edit profile), 15 (delete account)

class UserController {
    async getProfile(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        next(new Error('Not implemented'));
    }

    async deleteAccount(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Authentication required.' });
                return;
            }

            await UserService.deleteAccount(req.user.userID);

            res.status(200).json({ message: 'Account deleted successfully.' });
        } catch (error) {
            if (isServiceError(error)) {
                res.status(error.statusCode).json({ message: error.message });
                return;
            }

            if (error instanceof Error) {
                res.status(500).json({ message: error.message || 'Internal server error.' });
                return;
            }

            res.status(500).json({ message: 'Internal server error.' });
        }
    }
}

export default new UserController();
