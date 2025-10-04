import express from "express";
import { injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../../di/router.js";

@injectable()
export class GetUserController extends AuthRouteHandler<void> {
  async handle(req: AppAuthRequest, res: express.Response<void>): Promise<void> {
    res.end(`User: ${req.auth.userId}`);
  }
}
