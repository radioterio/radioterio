import { Application, Router } from "express";
import bodyParser from "body-parser";

import { makeBind } from "./bind.js";
import { getContainer } from "../app.js";
import { errorMiddleware } from "./middleware/error.js";
import { PublishEventRouteHandler } from "./routes/publish.js";
import { SubscribeEventRouteHandler } from "./routes/subscribe.js";

export function setupRouter(app: Application) {
  const router = Router();
  const bind = makeBind(getContainer(app));

  router.post("/events/:userId/publish", bodyParser.json(), bind(PublishEventRouteHandler));
  router.get("/events/:userId/subscribe", bind(SubscribeEventRouteHandler));

  router.use(errorMiddleware);

  app.use(router);
}

