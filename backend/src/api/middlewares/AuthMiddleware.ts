import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import UserService from '../services/UserService';
import AppConfig from '../../config/appConfig';
import { UnauthorizedError } from '../../errors';

// FR-25, FR-30: verify JWT and confirm user is still active on every request

class AuthMiddleware {
    async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(new UnauthorizedError());
            }

            const token = authHeader.slice(7); // strip "Bearer "
            if (!token) {
                return next(new UnauthorizedError());
            }

            let payload: any;
            try {
                payload = jwt.verify(token, AppConfig.app.secret as string);
            } catch {
                return next(new UnauthorizedError());
            }

            const user = await UserService.findById(payload.id);

            if (!user) {
                return next(new UnauthorizedError());
            }

            // FR-30: reject if account is currently locked
            if (user.lockoutUntil && user.lockoutUntil > new Date()) {
                return next(new UnauthorizedError());
            }

            req.userdata = user;
            next();
        } catch {
            next(new UnauthorizedError());
        }
    }
}

export default new AuthMiddleware();
