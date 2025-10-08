import { Readable, PassThrough, TransformOptions } from "node:stream";
import makeDebug from "debug";

const debug = makeDebug("app:stream-utils");

export const repeat = (provideReadable: () => Promise<Readable>): Readable => {
  const d = debug.extend(":repeat");

  const output = new PassThrough();
  let currentInput: Readable;

  output.on("error", (err) => {
    d("Error in output: %O", err);

    if (currentInput) {
      currentInput.destroy(err);
      d("Input destroyed");
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

export class CountingPassThrough extends PassThrough {
  public bytesPassed = 0;

  constructor(options?: TransformOptions) {
    super(options);

    this.on("data", (chunk) => {
      this.bytesPassed += chunk.length;
    });
  }

  /** Returns number of bytes passed through so far */
  get count() {
    return this.bytesPassed;
  }
}
