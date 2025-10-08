import express from "express";
import { SignJWT } from "jose";

import { Config } from "./config.js";
import { CountingPassThrough, repeat } from "./stream-utils.js";
import * as ff from "./ffmpeg.js";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";

const BPMS = 192;

const schema = z.object({
  track: z.object({
    trackUrl: z.string(),
    duration: z.number(),
  }),
  position: z.number(),
});

export function setupRoutes(app: express.Application, config: Config) {
  app.get("/channel/:channelId/get-audio", async (req, res) => {
    const { channelId } = req.params;
    const initialTime = Date.now();

    let bytesDecoded = 0;
    const stream = repeat(async () => {
      const played = Math.floor(bytesDecoded / BPMS);
      const currentTime = initialTime + played;

      const alg = "HS256";
      const token = await new SignJWT({ userId: 1 })
        .setProtectedHeader({ alg })
        .setExpirationTime("2h")
        .sign(config.jwtSecret);

      const srcUrl = `${config.apiServerUrl}/channels/${channelId}/now-playing-at/${currentTime}`;
      const resp = await fetch(srcUrl, { headers: { Authorization: `Bearer ${token}` } });
      const json = await resp.json();
      const now = schema.parse(json);
      const left = now.track.duration - now.position;

      console.log({ currentTime, played, left });

      const dec = ff.decode(now.track.trackUrl, now.position, left);

      dec.on("data", (chunk) => {
        bytesDecoded += chunk.length;
      });

      return dec;
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
