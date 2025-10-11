export class ParseError extends Error {
  constructor(
    readonly errors: string[],
    message?: string,
  ) {
    super(message);

    Error.captureStackTrace(this);
  }
}
