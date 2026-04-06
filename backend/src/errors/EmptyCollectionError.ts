import { AppError } from './AppError';

export class EmptyCollectionError extends AppError {
    constructor() {
        super('Cannot export an empty collection.', 422);
    }
}
