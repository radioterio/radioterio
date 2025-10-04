import { StatusCodes } from "http-status-codes";
import { ErrorKind } from "./error-kind.js";

const errorKindToStatusMap = new Map<ErrorKind, StatusCodes>([
  [ErrorKind.UserNotFound, StatusCodes.UNAUTHORIZED],
  [ErrorKind.MissingAuthorizationHeader, StatusCodes.BAD_REQUEST],
  [ErrorKind.IncorrectAuthorizationHeader, StatusCodes.UNAUTHORIZED],
]);

export function getStatusCode(kind: ErrorKind) {
  return errorKindToStatusMap.get(kind);
}
