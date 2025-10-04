import { Container } from "inversify";
import { Config } from "../config.js";

export function createContainer(config: Config) {
  const container = new Container();

  // TODO Setup di here
  void config;
  void container;

  return container;
}
