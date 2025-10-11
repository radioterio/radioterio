export type Either<L, R> = Left<L> | Right<R>;

export type Left<L> = {
  readonly left: L;
  readonly type: "left";
};
export type Right<R> = {
  readonly right: R;
  readonly type: "right";
};

export function isLeft<L, R>(either: Either<L, R>): either is Left<L> {
  return either.type === "left";
}

export function isRight<L, R>(either: Either<L, R>): either is Right<R> {
  return either.type === "right";
}

export function left<L>(left: L) {
  return { left, type: "left" as const };
}

export function right<R>(right: R) {
  return { right, type: "right" as const };
}
