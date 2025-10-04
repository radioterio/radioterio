import express from "express";
import { Container } from "inversify";

import { RouteHandler } from "./router.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctor = new (...args: any[]) => RouteHandler<any>;

export const makeBind = (container: Container) => {
  return (Ctor: Ctor): express.RequestHandler => {
    container.bind(Ctor).toSelf().inSingletonScope();
    const requestHandler = container.get(Ctor);

    return requestHandler.run.bind(requestHandler);
  };
};
