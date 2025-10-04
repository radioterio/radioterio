import { Application, Router } from "express";

import { makeBind } from "../di/bind.js";
import { getContainer } from "../app.js";
import { errorMiddleware } from "./middlewares/error.js";
import { HealthRouteHandler } from "./routes/health.js";
import { GetUserController } from "./routes/user/get-user.js";

export function setupRouter(app: Application) {
  const router = Router();
  const bind = makeBind(getContainer(app));

  router.get("/health", bind(HealthRouteHandler));
  router.get("/user", bind(GetUserController));

  router.use(errorMiddleware);

  app.use(router);
}
