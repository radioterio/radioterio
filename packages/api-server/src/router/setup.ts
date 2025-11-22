import { Application, Router } from "express";
import bodyParser from "body-parser";

import { makeBind } from "./bind.js";
import { getContainer } from "../app.js";
import { errorMiddleware } from "./middleware/error.js";
import { HealthRouteHandler } from "./routes/health.js";
import { GetUserController } from "./routes/user/get-user.js";
import { GetChannelsController } from "./routes/channel/get-channels.js";
import { GetChannelController } from "./routes/channel/get-channel.js";
import { GetChannelsTracksController } from "./routes/channel/get-channel-tracks.js";
import { GetNowPlayingController } from "./routes/channel/get-now-playing.js";
import { StopChannelController } from "./routes/channel/stop-channel.js";
import { PlayChannelController } from "./routes/channel/play-channel.js";
import { LoginRouteHandler } from "./routes/auth/login.js";

export function setupRouter(app: Application) {
  const router = Router();
  const bind = makeBind(getContainer(app));

  router.get("/health", bind(HealthRouteHandler));
  router.get("/user", bind(GetUserController));
  router.get("/channels", bind(GetChannelsController));
  router.get("/channels/:channelId", bind(GetChannelController));
  router.get("/channels/:channelId/tracks", bind(GetChannelsTracksController));
  router.get("/channels/:channelId/now-playing-at/:timestamp", bind(GetNowPlayingController));
  router.post("/channels/:channelId/play", bodyParser.json(), bind(PlayChannelController));
  router.post("/channels/:channelId/stop", bind(StopChannelController));
  router.post("/auth/login", bodyParser.json(), bind(LoginRouteHandler));

  router.use(errorMiddleware);

  app.use(router);
}
