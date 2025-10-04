import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { ErrorKind } from "../../errors/kind.js";

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: ErrorKind.InternalServerError,
  });
};
