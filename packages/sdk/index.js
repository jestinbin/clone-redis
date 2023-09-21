import { encode } from "./../commons/protocol.js";
import logger, { configLogger } from "./../commons/logger.js";
import Command from "./../commons/Command.js";
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

function createCommands(client) {
  const outMap = {
    get: createGetCommand,
    set: createSetCommand,
    del: createDelCommand,
    rpush: createRPushCommand,
    blpop: createBLPopCommand,
    // publish: ...,
    // subscribe: ...,
  };

  return Object.keys(outMap).reduce((acc, key) => {
    acc[key] = function () {
      return new Promise((resolve, reject) => {
        client.write(`${encode(outMap[key](...arguments))}\n`);
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
    client.once("data", (data) => {
      if (data.toString().trim() === "connected") {
        client.setNoDelay(true);
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
