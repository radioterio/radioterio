import express from "express";
import { Container } from "inversify";

import { AuthRouteHandler, RouteHandler } from "./route-handler.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ctor = new (...args: any[]) => RouteHandler<any> | AuthRouteHandler<any>;

export const makeBind = (container: Container) => {
  return (Ctor: Ctor): express.RequestHandler => {
    container.bind(Ctor).toSelf();

    const requestHandler = container.get(Ctor);

    return requestHandler.run.bind(requestHandler);
  };
};
