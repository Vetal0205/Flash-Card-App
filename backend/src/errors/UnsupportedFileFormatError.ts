import { AppError } from './AppError';

export class UnsupportedFileFormatError extends AppError {
    constructor(extension?: string) {
        // If extension is provided, include it in the message; otherwise, use a generic message
        super(
            extension
                ? `Unsupported file format: .${extension}`
                : 'Unsupported file format.',
            400
        );
    }
}
