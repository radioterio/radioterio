import { Application, Router } from "express";

import { makeBind } from "./bind.js";
import { getContainer } from "../app.js";
import { errorMiddleware } from "./middleware/error.js";
import { HealthRouteHandler } from "./routes/health.js";
import { GetUserController } from "./routes/user/get-user.js";
import { GetChannelsController } from "./routes/channel/get-channels.js";
import { GetChannelsTracksController } from "./routes/channel/get-channel-tracks.js";
import { GetNowPlayingController } from "./routes/channel/get-now-playing.js";

export function setupRouter(app: Application) {
  const router = Router();
  const bind = makeBind(getContainer(app));

  router.get("/health", bind(HealthRouteHandler));
  router.get("/user", bind(GetUserController));
  router.get("/channels", bind(GetChannelsController));
  router.get("/channels/:channelId/tracks", bind(GetChannelsTracksController));
  router.get("/channels/:channelId/now-playing-at/:timestamp", bind(GetNowPlayingController));

  router.use(errorMiddleware);

  app.use(router);
}
