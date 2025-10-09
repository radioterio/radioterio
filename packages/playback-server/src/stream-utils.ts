import { Readable, PassThrough, TransformOptions } from "node:stream";
import makeDebug from "debug";
import { RAW_AUDIO_BYTES_PER_MILLIS } from "./ffmpeg.js";

const debug = makeDebug("app:stream-utils");

export const repeat = (provideReadable: () => Promise<Readable>): Readable => {
  const d = debug.extend("repeat");

  const output = new PassThrough();

  let currentInput: Readable;

  output.on("error", (err) => {
    if (!isOutputStreamClosed(err)) {
      d("Error in output: %O", err);
    }

    if (currentInput) {
      currentInput.destroy(err);
    }
  });

  const handleInput = (input: Readable) => {
    currentInput = input;

    currentInput
      .once("end", () => {
        d("Input ended");
        return getNext();
      })
      .pipe(output, { end: false });
  };

  const handleError = (err: Error) => {
    d("Failed to get next input: %O", err);
    output.destroy(err);
  };

  const getNext = () => {
    d("Get next input");
    provideReadable().then(handleInput).catch(handleError);
  };

  getNext();

  return output;
};

export class DecodeProgress {
  private bytesPassed = 0;

  constructor(private readonly initialTime: number) {}

  get currentTime() {
    return this.initialTime + this.bytesPassed / RAW_AUDIO_BYTES_PER_MILLIS;
  }

  attachToStream(stream: Readable) {
    stream.on("data", (chunk) => {
      this.bytesPassed += chunk.length;
    });
  }
}

export function isOutputStreamClosed(error: Error) {
  return error.message.includes("Output stream closed");
}
