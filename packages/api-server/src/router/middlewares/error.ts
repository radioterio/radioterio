import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../../errors/app-error.js";

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    // TODO: Get status code for Error kind
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.kind,
    });
    return;
  }

  next(err);
};
