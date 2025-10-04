import { injectable } from "inversify";
import { StatusCodes } from "http-status-codes";
import express from "express";

import { AppRequest, RouteHandler } from "../../di/router.js";
import { getConfig } from "../../app.js";

interface ResponseBody {
  build: string | null;
}

@injectable()
export class HealthRouteHandler extends RouteHandler<ResponseBody> {
  async handle(req: AppRequest, res: express.Response<ResponseBody>): Promise<void> {
    const config = getConfig(req.app);

    res.status(StatusCodes.OK).json({ build: config.build });
  }
}
