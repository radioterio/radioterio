export class ServerError extends Error {
  constructor(
    readonly statusCode: number,
    message?: string,
  ) {
    super(message);

    Error.captureStackTrace(this);
  }
}
