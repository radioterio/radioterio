import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../../errors/app-error.js";
import { getStatusCode } from "../../errors/error-kind-to-status.js";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    const statusCode = getStatusCode(err.kind) ?? StatusCodes.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({ error: err.kind });
    return;
  }

  next(err);
};
