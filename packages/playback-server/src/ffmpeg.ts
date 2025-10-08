import { Readable, PassThrough } from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import makeDebug from "debug";

const KILL_SIGNAL = "SIGKILL";

export const RAW_AUDIO_FORMAT = {
  sampleRate: 48000,
  channels: 2,
  bitDepth: 16,
  codec: "pcm_s16le",
  format: "s16le",
} as const;

export interface EncoderParameters {
  bitrate: number;
  channels: number;
  format: string;
}

const debugEncoder = makeDebug("app:ffmpeg:encoder");

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
    debugEncoder(`Command failed: ${err}`);

    if (closeInputOnError) {
      src.destroy(err);
    }

    encoder.kill(KILL_SIGNAL);
  });

  encoder.on("start", (commandLine) => {
    debugEncoder(`Command started: ${commandLine}`);
  });

  encoder.pipe(output);

  return output;
}

const debugDecoder = makeDebug("app:ffmpeg:decoder");

const millisToSeconds = (millis: number) => millis / 1000;

export function decode(srcUrl: string, seekInput: number) {
  const output = new PassThrough();

  const decoder = ffmpeg()
    .audioCodec(RAW_AUDIO_FORMAT.codec)
    .audioChannels(RAW_AUDIO_FORMAT.channels)
    .audioFrequency(RAW_AUDIO_FORMAT.sampleRate)
    .outputFormat(RAW_AUDIO_FORMAT.format)
    .input(srcUrl)
    .seekInput(millisToSeconds(seekInput));

  decoder.on("error", (err) => {
    debugDecoder(`Command failed: ${err}`);
    decoder.kill(KILL_SIGNAL);
  });

  decoder.on("start", (commandLine) => {
    debugDecoder(`Command started: ${commandLine}`);
  });

  decoder.on("end", () => {
    debugDecoder(`Command finished`);
  });

  const start = Date.now();

  decoder.once("progress", () => {
    const real = Date.now();
    const delay = real - start;
    debugDecoder(`Delay: ${delay}ms`);
  });

  decoder.pipe(output);

  return output;
}
