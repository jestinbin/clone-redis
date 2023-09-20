import { encode } from "./../commons/protocol.js";
import logger, { configLogger } from "./../commons/logger.js";
import Command from "./../commons/Command.js";
import net from "net";

configLogger({
  level: "info",
  name: "sdk",
});

function createGetCommand(key) {
  return new Command("get", [key]);
}

function createSetCommand(key, value, seconds = -1) {
  return new Command("set", [key, value, seconds]);
}

function createDelCommand(key) {
  return new Command("del", [key]);
}

function clearEventListner(client) {
  client.removeAllListeners("data");
  client.removeAllListeners("error");
}

async function createConnection(port, host) {
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

  const outMap = {
    get: createGetCommand,
    set: createSetCommand,
    del: createDelCommand,
    // rpush: ...,
    // blpop: ...,
    // publish: ...,
    // subscribe: ...,
  };

  return Object.keys(outMap).reduce((acc, key) => {
    acc[key] = function () {
      return new Promise((resolve, reject) => {
        client.write(`${encode(outMap[key](...arguments))}\n`);
        client.once("data", (data) => {
          const outcome = JSON.parse(data.toString());
          if (outcome === "error") {
            reject(new Error("Error on messaging"));
          } else {
            resolve(outcome);
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

  // TODO: remove
  // function sendcommand(fn) {
  //   return function () {
  //     client.write(`${encode(fn(...arguments))}\n`);
  //   };
  // }
  // return {
  //   get: sendcommand(createGetCommand),
  //   set: sendcommand(createSetCommand),
  //   del: sendcommand(createDelCommand),
  // };
}

export default { createClient };
