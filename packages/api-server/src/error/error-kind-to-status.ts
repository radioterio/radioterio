import { StatusCodes } from "http-status-codes";
import { ErrorKind } from "./error-kind.js";

const errorKindToStatusMap = new Map<ErrorKind, StatusCodes>([
  [ErrorKind.UserNotFound, StatusCodes.UNAUTHORIZED],
  [ErrorKind.MissingAuthorizationHeader, StatusCodes.BAD_REQUEST],
  [ErrorKind.IncorrectAuthorizationHeader, StatusCodes.UNAUTHORIZED],
  [ErrorKind.ChannelNotFound, StatusCodes.NOT_FOUND],
  [ErrorKind.ChannelPaylistIsEmpty, StatusCodes.CONFLICT],
]);

export function getStatusCode(kind: ErrorKind) {
  return errorKindToStatusMap.get(kind);
}
