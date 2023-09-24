import { encode } from "../commons/protocol.js";
import logger, { configLogger } from "../commons/logger.js";
import CustomError from "../commons/customError.js";
import net from "net";
import {
  createGetCommand,
  createSetCommand,
  createDelCommand,
  createRPushCommand,
  createBLPopCommand,
  createPublishCommand,
  createSubscribeCommand,
} from "./commands.js";

// configLogger({
//   level: "info",
//   name: "sdk",
// });

let sigintHandled = false;

function clearEventListner(client) {
  client.removeAllListeners("data");
  client.removeAllListeners("error");
}

function handleData(data, cbSuccess, cdError) {
  const dataStr = data.toString().trim();
  if (dataStr === "undefined") {
    cbSuccess(null, undefined);
  } else if (/^error/.test(dataStr)) {
    cdError(new Error(dataStr));
  } else {
    cbSuccess(null, JSON.parse(dataStr));
  }
}

function createApiInterface(client) {
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
          handleData(
            data,
            (err, val) => fn(err, val),
            (err, val) => fn(err, null)
          );
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
          handleData(
            data,
            (err, val) => resolve(val),
            (err, val) => reject(err)
          );
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
  const apiInterface = createApiInterface(client);

  const close = () => {
    client.end();
  };

  if (sigintHandled === false) {
    process.on("SIGINT", function () {
      console.log("\nSIGINT...");
      close();
      process.exit();
    });
    sigintHandled = true;
  }

  return {
    ...apiInterface,
    close,
  };
}

export { createClient };
