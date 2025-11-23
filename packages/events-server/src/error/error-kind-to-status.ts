import { StatusCodes } from "http-status-codes";

import { ErrorKind } from "./error-kind.js";

export function getStatusCode(kind: ErrorKind): number | undefined {
  switch (kind) {
    case ErrorKind.InvalidEventData:
    case ErrorKind.InvalidUserId:
      return StatusCodes.BAD_REQUEST;
    case ErrorKind.InternalServerError:
      return StatusCodes.INTERNAL_SERVER_ERROR;
    default:
      return undefined;
  }
}

