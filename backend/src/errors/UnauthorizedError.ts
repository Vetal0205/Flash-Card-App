import { AppError } from './AppError';

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized. Please log in to continue.') {
        super(message, 401);
    }
}
