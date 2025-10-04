import { ErrorKind } from "./kind.js";
import { AppError } from "./app-error.js";

export function ok<T>(exp: T | undefined | null, kind: ErrorKind, message?: string): asserts exp {
  if (exp === null || exp === undefined) {
    throw AppError.fromErrorKind(kind, message);
  }
}
