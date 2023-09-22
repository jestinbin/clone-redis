import {
  createGetCommand,
  createSetCommand,
  createDelCommand,
  createRPushCommand,
  createBLPopCommand,
  createPublishCommand,
  createSubscribeCommand,
} from "../commands.js";

import Command from "../../commons/Command.js";

describe("Command creation functions", () => {
  it("should create a get command", () => {
    const command = createGetCommand("key1");
    expect(command).toBeInstanceOf(Command);
    expect(command.name).toBe("get");
    expect(command.args).toEqual(["key1"]);
  });

  it("should create a set command", () => {
    const command = createSetCommand("key1", "value1", 10);
    expect(command).toBeInstanceOf(Command);
    expect(command.name).toBe("set");
    expect(command.args).toEqual(["key1", "value1", 10]);
  });

  it("should create a delete command", () => {
    const command = createDelCommand("key1");
    expect(command).toBeInstanceOf(Command);
    expect(command.name).toBe("del");
    expect(command.args).toEqual(["key1"]);
  });

  it("should create a rpush command", () => {
    const command = createRPushCommand("key1", "value1");
    expect(command).toBeInstanceOf(Command);
    expect(command.name).toBe("rpush");
    expect(command.args).toEqual(["key1", "value1"]);
  });

  it("should create a blpop command", () => {
    const command = createBLPopCommand("key1");
    expect(command).toBeInstanceOf(Command);
    expect(command.name).toBe("blpop");
    expect(command.args).toEqual(["key1"]);
  });

  it("should create a publish command", () => {
    const command = createPublishCommand("key1", "value1");
    expect(command).toBeInstanceOf(Command);
    expect(command.name).toBe("publish");
    expect(command.args).toEqual(["key1", "value1"]);
  });

  it("should create a subscribe command", () => {
    const command = createSubscribeCommand("key1");
    expect(command).toBeInstanceOf(Command);
    expect(command.name).toBe("subscribe");
    expect(command.args).toEqual(["key1"]);
  });
});
