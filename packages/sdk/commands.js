import Command from "../commons/Command.js";

export function createGetCommand(key) {
  return new Command("get", [key]);
}

export function createSetCommand(key, value, seconds = -1) {
  return new Command("set", [key, value, seconds]);
}

export function createDelCommand(key) {
  return new Command("del", [key]);
}

export function createRPushCommand(key, value) {
  return new Command("rpush", [key, value]);
}

export function createBLPopCommand(key) {
  return new Command("blpop", [key]);
}

export function createPublishCommand(key, value) {
  return new Command("publish", [key, value]);
}

export function createSubscribeCommand(key) {
  return new Command("subscribe", [key]);
}
