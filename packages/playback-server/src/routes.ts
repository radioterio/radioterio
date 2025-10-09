import express from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

import { Config } from "./config.js";
import { DecodeProgress, repeat } from "./stream-utils.js";
import * as ff from "./ffmpeg.js";
import { createToken } from "./auth.js";

const schema = z.object({
  track: z.object({
    trackUrl: z.string(),
    duration: z.number(),
  }),
  position: z.number(),
});

export function setupRoutes(app: express.Application, config: Config) {
  app.get("/user/:userId/channel/:channelId/stream", async (req, res) => {
    const initialTime = Date.now();

    const progress = new DecodeProgress(initialTime);
    const stream = repeat(async () => {
      const userId = parseInt(req.params.userId, 10);
      const token = await createToken(userId, config.jwtSecret);
      const srcUrl = `${config.apiServerUrl}/channels/${req.params.channelId}/now-playing-at/${progress.currentTime}`;
      const resp = await fetch(srcUrl, { headers: { Authorization: `Bearer ${token}` } });
      const json = await resp.json();
      console.log(srcUrl, JSON.stringify(json, null, 2));
      const now = schema.parse(json);
      const left = now.track.duration - now.position;
      const decoderStream = ff.decode(now.track.trackUrl, now.position, left);

      progress.attachToStream(decoderStream);

      return decoderStream;
    });

    const encoder = ff.encode(
      stream,
      {
        bitrate: 256_000,
        channels: 2,
        format: "mp3",
        codec: "libmp3lame",
      },
      true,
    );

    res
      .setHeader("Content-Type", "audio/mpeg")
      .status(StatusCodes.OK)
      .on("close", () => encoder.destroy());

    encoder.pipe(res);
  });
}
