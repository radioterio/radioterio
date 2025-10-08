import { Readable, PassThrough } from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import makeDebug from "debug";

const debug = makeDebug("app:ffmpeg");

const KILL_SIGNAL = "SIGKILL";

export const RAW_AUDIO_FORMAT = {
  sampleRate: 48000,
  channels: 2,
  bitDepth: 16,
  codec: "pcm_s16le",
} as const;

export interface EncoderParameters {
  bitrate: number;
  channels: number;
  format: string;
}

export function encoder(
  src: Readable,
  params: EncoderParameters,
  closeInputOnError: boolean,
): Readable {
  const output = new PassThrough();

  const encoder = ffmpeg(src)
    .inputOptions([`-ac ${RAW_AUDIO_FORMAT.channels}`, `-ar ${RAW_AUDIO_FORMAT.sampleRate}`])
    .inputFormat(RAW_AUDIO_FORMAT.codec)
    .audioBitrate(params.bitrate)
    .audioChannels(params.channels)
    .outputFormat(params.format);

  encoder.on("error", (err) => {
    debug(`Encoder command failed: ${err}`);

    if (closeInputOnError) {
      src.destroy(err);
    }

    encoder.kill(KILL_SIGNAL);
  });

  encoder.on("start", (commandLine) => {
    debug(`Encoder command started: ${commandLine}`);
  });

  encoder.pipe(output);

  return output;
}
