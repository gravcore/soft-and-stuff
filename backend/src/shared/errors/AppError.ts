// Base class for all intentional errors in this app.
export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly code: string,
        public readonly errors?: { field: string, message: string, code: string }[]
    ) {
        super(message);
        this.name = 'AppError';
        Object.setPrototypeOf(this, new.target.prototype); // fixes instanceof breaking in old ES5 compiled code
    }
}