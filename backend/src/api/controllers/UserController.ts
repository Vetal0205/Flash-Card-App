import { Request, Response, NextFunction } from 'express';
import UserService from '../services/UserService';

// Handles HTTP for: GET/PATCH /users/me, DELETE /users/me, PATCH /users/me/password
// Use Cases 6 (edit profile), 15 (delete account)

class UserController {
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const profile = await UserService.getProfile(userID);
            res.status(200).json(profile);
        } catch (err) {
            next(err);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;

            // FR-06: update profile fields for authenticated user.
            const updated = await UserService.updateProfile(userID, req.body);
            res.status(200).json(updated);
        } catch (err) {
            next(err);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            const { currentPassword, newPassword } = req.body;

            // FR-06/FR-27: password change for authenticated user context.
            await UserService.changePassword(userID, { currentPassword, newPassword });
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async deleteAccount(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;

            // FR-09: frontend confirms action; backend executes deletion.
            const result = await UserService.deleteAccount(userID);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
}

export default new UserController();
