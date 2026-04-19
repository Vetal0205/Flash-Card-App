import { AppError } from './AppError';

export class CollectionNotFoundError extends AppError {
    constructor() {
        super('Collection not found.', 404);
    }
}
