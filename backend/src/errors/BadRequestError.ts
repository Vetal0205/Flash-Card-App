import { AppError } from './AppError';

export class BadRequestError extends AppError {
    readonly details?: unknown[];

    constructor(message = 'Bad request.', details?: unknown[]) {
        super(message, 400);
        this.details = details;
    }
}
