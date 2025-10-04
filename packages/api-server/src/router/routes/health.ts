import { injectable, inject } from "inversify";
import { StatusCodes } from "http-status-codes";
import express from "express";

import { AppRequest, RouteHandler } from "../route-handler.js";
import { getConfig } from "../../app.js";
import { KnexClient } from "../../db/knex.js";

interface ResponseBody {
  build: string | null;
}

@injectable()
export class HealthRouteHandler extends RouteHandler<ResponseBody> {
  constructor(@inject(KnexClient) private readonly knexClient: KnexClient) {
    super();
  }

  async handle(req: AppRequest, res: express.Response<ResponseBody>): Promise<void> {
    const config = getConfig(req.app);

    await this.knexClient.client.raw("SELECT 1");

    res.status(StatusCodes.OK).json({ build: config.build });
  }
}
