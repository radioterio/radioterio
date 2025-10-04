import { Application, Router } from "express";

import { makeBind } from "../di/bind.js";
import { getContainer } from "../app.js";
import { HealthRouteHandler } from "./routes/health.js";

export function setupRouter(app: Application) {
  const router = Router();
  const bind = makeBind(getContainer(app));

  router.get("/health", bind(HealthRouteHandler));

  app.use(router);
}
