import { AppError } from './AppError';

export class ForbiddenError extends AppError {
    constructor(message = 'Access to this collection is not allowed.') {
        super(message, 403);
    }
}
