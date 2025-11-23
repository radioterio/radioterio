import express, { Express } from "express";
import { Container } from "inversify";

import { setupRouter } from "./router/setup.js";
import { Config } from "./config.js";

export const getConfig = (app: express.Application): Config => {
  const config = app.get("config");

  if (!(config instanceof Config)) {
    throw new Error("Config is not correctly attached to the app.");
  }

  return config;
};

export const getContainer = (app: express.Application): Container => {
  const container = app.get("container");

  if (!(container instanceof Container)) {
    throw new Error("Container is not correctly attached to the app.");
  }

  return container;
};

export function createApp(config: Config, container: Container): Express {
  const app = express();

  app.set("config", config);
  app.set("container", container);

  setupRouter(app);

  return app;
}

