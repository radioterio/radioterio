import express from "express";
import { inject, injectable } from "inversify";

import { AppAuthRequest, AuthRouteHandler } from "../../route-handler.js";
import { UserRepository } from "../../../repo/user.js";
import { ErrorKind } from "../../../error/error-kind.js";
import { ok } from "../../../error/assert.js";

interface UserOutput {
  readonly id: number;
  readonly email: string;
}

@injectable()
export class GetUserController extends AuthRouteHandler<UserOutput> {
  constructor(@inject(UserRepository) private readonly userRepository: UserRepository) {
    super();
  }

  async handle(req: AppAuthRequest, res: express.Response<UserOutput>): Promise<void> {
    const user = await this.userRepository.findOneById(req.auth.userId);
    ok(user, ErrorKind.UserNotFound);

    res.json({
      id: user.id,
      email: user.email,
    });
  }
}
