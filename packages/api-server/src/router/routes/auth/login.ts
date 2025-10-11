import express from "express";
import z from "zod";
import { inject, injectable } from "inversify";

import { AppRequest, RouteHandler } from "../../route-handler.js";
import { UserRepository } from "../../../repo/user.js";
import { ErrorKind } from "../../../error/error-kind.js";
import { ok } from "../../../error/assert.js";
import { verifyPassword } from "@radioterio/common/utils/bcrypt";
import { getConfig } from "../../../app.js";
import { createToken } from "@radioterio/common/utils/auth";

const RequestBodySchema = z.object({
  email: z.email().min(1),
  password: z.string().min(1),
});

interface LoginResponse {
  accessToken: string;
}

@injectable()
export class LoginRouteHandler extends RouteHandler<LoginResponse> {
  constructor(@inject(UserRepository) private readonly userRepository: UserRepository) {
    super();
  }

  async handle(req: AppRequest, res: express.Response<LoginResponse>): Promise<void> {
    const result = RequestBodySchema.safeParse(req.body);
    ok(result.success, ErrorKind.MissingEmailOrPassword);

    const user = await this.userRepository.findOneByEmail(result.data.email);
    ok(user, ErrorKind.WrongEmailOrPassword);

    const isValidPassword = await verifyPassword(result.data.password, user.passwordHash);
    ok(isValidPassword, ErrorKind.WrongEmailOrPassword);

    const config = getConfig(req.app);
    const accessToken = await createToken(user.id, config.jwtSecret, "24h");

    res.json({ accessToken });
  }
}
