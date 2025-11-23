import { ErrorKind } from "./error-kind.js";

export class AppError extends Error {
  constructor(
    readonly kind: ErrorKind,
    message?: string,
  ) {
    super(message);

    this.name = `${this.constructor.name}(${kind})`;

    Error.captureStackTrace(this, this.constructor);
  }

  static fromErrorKind(kind: ErrorKind, message?: string): AppError {
    return new AppError(kind, message);
  }
}

