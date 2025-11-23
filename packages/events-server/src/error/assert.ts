import { AppError } from "./app-error.js";
import { ErrorKind } from "./error-kind.js";

export function ok<T>(value: T | null | undefined, errorKind: ErrorKind): asserts value is T {
  if (!value) {
    throw AppError.fromErrorKind(errorKind);
  }
}

