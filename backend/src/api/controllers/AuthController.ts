import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';

// Handles HTTP for: POST /auth/register, POST /auth/login, POST /auth/logout
// Use Cases 1 (login) and 2 (register)

class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            const result = await AuthService.register({ username, email, password });
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { credential, password, rememberMe } = req.body;
            const result = await AuthService.login({ credential, password, rememberMe });
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = (req as any).userdata?.userID;
            await AuthService.logout(userID);
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default new AuthController();
