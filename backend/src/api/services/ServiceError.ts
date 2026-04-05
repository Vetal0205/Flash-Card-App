class ServiceError extends Error {
    readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = 'ServiceError';
        this.statusCode = statusCode;
    }
}

export function isServiceError(error: unknown): error is ServiceError {
    return error instanceof ServiceError;
}

export default ServiceError;
