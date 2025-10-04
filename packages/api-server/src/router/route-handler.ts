import express from "express";
import { injectable } from "inversify";
import { jwtVerify } from "jose";
import z from "zod";

import { Nominal } from "@radioterio/common/utils/types";
import { ErrorKind } from "../error/error-kind.js";
import { ok } from "../error/assert.js";
import { getConfig } from "../app.js";
import { AppError } from "../error/app-error.js";

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

const AuthDataSchema = z.object({ userId: z.number() });
type AuthData = z.output<typeof AuthDataSchema>;
export type AppAuthRequest = Nominal<express.Request & { auth: AuthData }, "AuthRequest">;
const makeAppAuthRequest = (req: express.Request, auth: AuthData): AppAuthRequest => {
  Object.assign(req, { auth });
  return req as AppAuthRequest;
};

export abstract class AuthRouteHandler<T> {
  private static jwtSecretKey?: Uint8Array;

  abstract handle(
    req: AppAuthRequest,
    res: express.Response<T>,
    next: express.NextFunction,
  ): Promise<void>;

  async run(req: express.Request, res: express.Response<T>, next: express.NextFunction) {
    try {
      console.log(req.headers);
      const authorization = req.get("authorization");
      ok(authorization, ErrorKind.MissingAuthorizationHeader);

      const config = getConfig(req.app);

      const jwtToken = authorization.replace("Bearer ", "");
      let payload;
      try {
        const verifyResult = await jwtVerify(jwtToken, config.jwtSecret);
        payload = verifyResult.payload;
      } catch {
        next(AppError.fromErrorKind(ErrorKind.IncorrectAuthorizationHeader));
        return;
      }

      const result = AuthDataSchema.safeParse(payload);
      ok(result.success, ErrorKind.IncorrectAuthorizationHeader);

      await this.handle(makeAppAuthRequest(req, result.data), res, next);

      next();
    } catch (err) {
      next(err);
    }
  }
}
