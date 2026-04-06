import { AppError } from './AppError';

export class NoFileSelectedError extends AppError {
    constructor() {
        super('Please select a file to upload.', 400);
    }
}
