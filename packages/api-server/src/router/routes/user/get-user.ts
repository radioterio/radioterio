import express from "express";
import { inject, injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../../di/router.js";
import { User, UserRepository } from "../../../repo/user.js";
import { ErrorKind } from "../../../errors/kind.js";
import { ok } from "../../../errors/assert.js";

@injectable()
export class GetUserController extends AuthRouteHandler<User> {
  constructor(@inject(UserRepository) private readonly userRepository: UserRepository) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<User>): Promise<void> {
    const user = await this.userRepository.findOneById(req.auth.userId);
    ok(user, ErrorKind.UserNotFound);

    res.json(user);
  }
}
