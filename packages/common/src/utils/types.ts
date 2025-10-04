export type Nominal<Type, Identifier> = Type & {
  readonly __brand: Identifier;
};

// This function enforces exhaustive checking by throwing an error if an unexpected case occurs.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(_x: never): never {
  throw new Error("Didn't expect to get here");
}
