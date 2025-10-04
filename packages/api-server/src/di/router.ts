import express from "express";
import { injectable } from "inversify";

import { Nominal } from "@radioterio/common/utils/types";

export type AppRequest = Nominal<express.Request, "Request">;
const makeAppRequest = (req: express.Request): AppRequest => req as AppRequest;

@injectable()
export abstract class RouteHandler<T> {
  abstract handle(
    req: AppRequest,
    res: express.Response<T>,
    next: express.NextFunction,
  ): Promise<void>;

  async run(req: express.Request, res: express.Response<T>, next: express.NextFunction) {
    try {
      await this.handle(makeAppRequest(req), res, next);

      next();
    } catch (err) {
      next(err);
    }
  }
}
