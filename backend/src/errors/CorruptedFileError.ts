import { AppError } from './AppError';

export class CorruptedFileError extends AppError {
    constructor() {
        super('File contains null bytes/ control characters.', 422);
    }
}
