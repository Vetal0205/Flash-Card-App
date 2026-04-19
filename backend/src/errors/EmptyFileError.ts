import { AppError } from './AppError';

export class EmptyFileError extends AppError {
    constructor() {
        super('The uploaded file contains no recognizable flashcard data.', 422);
    }
}
