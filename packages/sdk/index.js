import { encode } from "../commons/protocol.js";
import logger, { configLogger } from "../commons/logger.js";
import Command from "../commons/Command.js";
import CustomError from "../commons/customError.js";
import net from "net";

configLogger({
  level: "info",
  name: "sdk",
});

function clearEventListner(client) {
  client.removeAllListeners("data");
  client.removeAllListeners("error");
}

function createGetCommand(key) {
  return new Command("get", [key]);
}

function createSetCommand(key, value, seconds = -1) {
  return new Command("set", [key, value, seconds]);
}

function createDelCommand(key) {
  return new Command("del", [key]);
}

function createRPushCommand(key, value) {
  return new Command("rpush", [key, value]);
}

function createBLPopCommand(key) {
  return new Command("blpop", [key]);
}

function createPublishCommand(key, value) {
  return new Command("publish", [key, value]);
}

function createSubscribeCommand(key) {
  return new Command("subscribe", [key]);
}

function createCommands(client) {
  const outMap = {
    get: createGetCommand,
    set: createSetCommand,
    del: createDelCommand,
    rpush: createRPushCommand,
    blpop: createBLPopCommand,
    publish: createPublishCommand,
    subscribe: createSubscribeCommand,
  };

  return Object.keys(outMap).reduce((acc, commandKey) => {
    let mode = "client-server"; // or "pubsub"

    acc[commandKey] = function () {
      // subscribe command
      if (commandKey === "subscribe" && mode !== "pubsub") {
        mode = "pubsub";
        const fn = arguments[1];
        client.write(`${encode(outMap[commandKey](arguments[0]))}\n`);
        client.on("data", (data) => {
          const dataStr = data.toString().trim();
          if (dataStr === "undefined") {
            fn(null, undefined);
          } else if (/^error/.test(dataStr)) {
            fn(new Error(dataStr), null);
          } else {
            fn(null, JSON.parse(dataStr));
          }
        });
        client.on("error", (error) => {
          logger.error("Error on connection:", error);
          fn(new Error(error), null);
        });
        return;
      }

      if (commandKey === "subscribe" && mode === "pubsub") {
        throw new CustomError("can't subscribe more than one time");
      }

      // ... remaining commands
      return new Promise((resolve, reject) => {
        const okPublishCondition =
          commandKey === "publish" && mode === "pubsub";
        if (commandKey !== "publish" && mode === "pubsub") {
          throw new CustomError(
            `when in pubsub mode, can't issue non-publish, non-subscribe command; key:${key}, mode:${mode}`
          );
        }
        client.write(`${encode(outMap[commandKey](...arguments))}\n`);
        client.once("data", (data) => {
          const dataStr = data.toString().trim();
          if (dataStr === "undefined") {
            resolve(undefined);
          } else if (/^error/.test(dataStr)) {
            reject(new Error(dataStr));
          } else {
            resolve(JSON.parse(dataStr));
          }
          clearEventListner(client);
        });
        client.once("error", (error) => {
          logger.error("Error on connection:", error);
          reject(new Error(error));
          clearEventListner(client);
        });
      });
    };
    return acc;
  }, {});
}

function createConnection(port, host) {
  const clientPromise = new Promise((resolve, reject) => {
    const client = net.createConnection(port, host, () => {
      logger.info("Connected to the server");
    });
    client.setNoDelay(true);
    client.once("data", (data) => {
      if (data.toString().trim() === "connected") {
        resolve(client);
      } else {
        reject(new Error("Expected 'connected' message on client connection."));
      }
      clearEventListner(client);
    });
    client.once("error", (error) => {
      logger.error("Error during connection:", error);
      reject(new Error(error));
      clearEventListner(client);
    });
  });

  return clientPromise;
}

async function createClient(port = 8080, host = "127.0.0.1") {
  const client = await createConnection(port, host);
  const commands = createCommands(client);

  const close = () => {
    client.end();
  };

  return {
    ...commands,
    close,
  };
}

export { createClient };
