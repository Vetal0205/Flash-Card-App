import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AppConfig from '../../config/appConfig';

type AuthPayload = {
    userID?: unknown;
    id?: unknown;
};

class AuthMiddleware {
    private toPositiveInteger(value: unknown): number | null {
        if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
            return value;
        }

        if (typeof value === 'string' && value.trim() !== '') {
            const parsed = Number.parseInt(value, 10);

            if (Number.isInteger(parsed) && parsed > 0) {
                return parsed;
            }
        }

        return null;
    }

    private readUserIdFromPayload(payload: AuthPayload | undefined): number | null {
        if (!payload) {
            return null;
        }

        return this.toPositiveInteger(payload.userID) ?? this.toPositiveInteger(payload.id);
    }

    private decodeBearerUserId(req: Request): number | null {
        const authorizationHeader = req.header('authorization');

        if (!authorizationHeader?.startsWith('Bearer ')) {
            return null;
        }

        const token = authorizationHeader.slice('Bearer '.length).trim();

        if (!token || !AppConfig.app.secret) {
            return null;
        }

        try {
            const decoded = jwt.verify(token, AppConfig.app.secret);

            if (typeof decoded === 'string') {
                return null;
            }

            return this.toPositiveInteger(decoded.userID) ?? this.toPositiveInteger(decoded.id);
        } catch {
            return null;
        }
    }

    private resolveUserId(req: Request): number | null {
        return (
            this.readUserIdFromPayload(req.user) ??
            this.toPositiveInteger(req.header('x-user-id')) ??
            this.decodeBearerUserId(req)
        );
    }

    requireAuth(req: Request, res: Response, next: NextFunction): void {
        const userID = this.resolveUserId(req);

        if (!userID) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }

        req.user = { userID };
        next();
    }
}

export default new AuthMiddleware();
