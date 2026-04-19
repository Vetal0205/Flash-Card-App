import express, { Application, Request, Response, NextFunction } from 'express';
import compression from 'compression';
import cors from 'cors';
import AppConfig from './config/appConfig';
import routesV1 from './api/routes/v1';
import { db } from './database/config';
import { AppError, BadRequestError } from './errors';

export function createServer(): Application {
    const app = express();

    // CORS
    app.use(cors({ origin: AppConfig.cors.origin, credentials: true }));

    // Body parsing
    app.use(express.urlencoded({ extended: false, limit: '5mb' }));
    app.use(express.json({ limit: '5mb' }));
    app.use(compression());


    // Health check
    app.get('/health', async (_req, res) => {
        try {
            await db.authenticate();
            res.status(200).json({ status: 'ok', uptime: process.uptime(), database: 'connected' });
        } catch {
            res.status(503).json({ status: 'error', uptime: process.uptime(), database: 'disconnected' });
        }
    });

    // API routes
    app.use(`/api/${AppConfig.app.apiVersion}`, routesV1);

    // Global error handler — must be registered after all routes.
    // Handles AppError subclasses with their status codes; falls back to 500 for unexpected errors.
    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof BadRequestError) {
            const body: Record<string, unknown> = { message: err.message };
            if (err.details) body.errors = err.details;
            res.status(err.statusCode).json(body);
            return;
        }

        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }

        if (!AppConfig.app.isDevelopment) {
            res.status(500).json({ message: 'Internal server error.' });
            return;
        }

        const message = err instanceof Error ? err.message : 'Internal server error.';
        const stack   = err instanceof Error ? err.stack   : undefined;
        res.status(500).json({ message, stack });
    });

    return app;
}
