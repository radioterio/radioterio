import { Readable, PassThrough } from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import { spawn } from "node:child_process";
import makeDebug from "debug";
import { isOutputStreamClosed } from "./stream-utils.js";

const debug = makeDebug("app:ffmpeg");

const KILL_SIGNAL = "SIGKILL";

export const RAW_AUDIO_FORMAT = {
  sampleRate: 48000,
  channels: 2,
  bitDepth: 16,
  codec: "pcm_s16le",
  format: "s16le",
} as const;

export const RAW_AUDIO_BYTES_PER_MILLIS =
  (RAW_AUDIO_FORMAT.bitDepth / 8) *
  RAW_AUDIO_FORMAT.channels *
  (RAW_AUDIO_FORMAT.sampleRate / 1_000);

export interface EncoderParameters {
  bitrate: number;
  channels: number;
  format: string;
  codec: string;
}

export function encode(
  src: Readable,
  params: EncoderParameters,
  closeInputOnError: boolean,
): Readable {
  const d = debug.extend(":encoder");

  const output = new PassThrough();

  const encoder = ffmpeg(src)
    .inputOptions([`-ac ${RAW_AUDIO_FORMAT.channels}`, `-ar ${RAW_AUDIO_FORMAT.sampleRate}`])
    .inputFormat(RAW_AUDIO_FORMAT.format)
    .audioBitrate(params.bitrate)
    .audioChannels(params.channels)
    .audioCodec(params.codec)
    .outputFormat(params.format);

  encoder.on("start", (commandLine) => {
    d(`Command started: ${commandLine}`);
  });

  encoder.on("end", () => {
    d(`Command finished`);
  });

  encoder.on("error", (err) => {
    if (!isOutputStreamClosed(err)) {
      d(`Command failed: ${err}`);
    }

    if (closeInputOnError) {
      src.destroy(err);
    }

    encoder.kill(KILL_SIGNAL);
  });

  encoder.pipe(output, { end: true });

  return output;
}

const millisToSeconds = (millis: number) => millis / 1000;

export function decode(srcUrl: string, seekInput: number, duration: number): Readable {
  const d = debug.extend(":decoder");

  const output = new PassThrough();

  const durationSeconds = millisToSeconds(duration).toFixed(3);
  const seekSeconds = millisToSeconds(seekInput).toFixed(3);
  const process = spawn("ffmpeg", [
    "-ss",
    seekSeconds,
    "-i",
    srcUrl,
    "-f",
    `${RAW_AUDIO_FORMAT.format}`,
    "-t",
    `${durationSeconds}`,
    "-i",
    "/dev/zero",
    "-filter_complex",
    `amix=inputs=2:duration=longest,atrim=duration=${durationSeconds},asetpts=PTS-STARTPTS`,
    "-acodec",
    RAW_AUDIO_FORMAT.codec,
    "-ac",
    String(RAW_AUDIO_FORMAT.channels),
    "-ar",
    String(RAW_AUDIO_FORMAT.sampleRate),
    "-f",
    String(RAW_AUDIO_FORMAT.format),
    "-",
  ]);

  process.on("spawn", () => {
    d(`Command started: %s`, process.spawnargs.join(" "));
  });

  process.on("close", () => {
    d(`Command finished`);
  });

  output.on("error", (err) => {
    if (!isOutputStreamClosed(err)) {
      d(`Command failed: ${err}`);
    }

    process.kill(KILL_SIGNAL);
  });

  process.stdout.pipe(output);

  return output;
}
