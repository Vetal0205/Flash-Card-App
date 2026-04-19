import { AppError } from './AppError';

export class FileTooLargeError extends AppError {
    constructor(limitMb = 50) {
        super(`File size exceeds the maximum allowed limit of ${limitMb} MB.`, 413);
    }
}
