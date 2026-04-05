import { AppError } from './AppError';

export class InvalidFlashcardFormatError extends AppError {
    constructor() {
        super('No valid flashcard format detected.', 422);
    }
}
