import express, { Express } from "express";

import { Config } from "./config.js";

export function makeApp(config: Config): Express {
  void config;

  return express();
}
