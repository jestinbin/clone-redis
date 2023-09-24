import net from "net";
import commandProcessorInit from "./processor.js";
import Store from "./store/store.js";
import StoreCleaner from "./store/storeCleaner.js";
import StoreLogManager from "./store/storeLogManager.js";
import logger, { configLogger } from "../commons/logger.js";

// configLogger({
//   level: process.ENV.severity || "info",
//   name: "server",
// });

let sigintHandled = false;

function createStore(
  withCleanup = false,
  withPersistence = false,
  persistencePath = null,
  resetPersistence = false
) {
  const logConfig = persistencePath ? { logPath: persistencePath } : {};
  const logManager = withPersistence ? new StoreLogManager(logConfig) : null;

  const store = new Store({ logManager, resetPersistence });

  const cleaner = withCleanup ? new StoreCleaner(store, 50, 1000, true) : null;

  return { store, storeCleaner: cleaner, logManager };
}

async function createTCPServer(store, port, address) {
  return new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      socket.setNoDelay(true);

      logger.debug(
        "Client connected: " + socket.remoteAddress + ":" + socket.remotePort
      );

      const outFn = (message) => {
        let out;
        if (message === undefined) {
          out = "undefined";
        } else {
          out = JSON.stringify(message);
        }
        socket.write(`${out}\n`);
      };

      const outErrorFn = (error) => {
        const source = error?.originalError;
        const stack = JSON.stringify(error?.stack);
        const extra = JSON.stringify(error?.extra);
        socket.write(`error|||${error}|||${source}|||${stack}|||${extra}\n`);
      };

      const processor = commandProcessorInit(store, outFn);

      socket.on("data", (request) => {
        try {
          processor(request);
        } catch (error) {
          logger.error(error);
          outErrorFn(error);
        }
      });

      socket.on("end", () => {
        logger.debug("client disconnected");
      });

      socket.write("connected\n");
      // socket.pipe(socket);
    });

    server.listen(port, address, () => {
      logger.debug(`TCP server running on ${address}:${port}`);
      resolve(server);
    });

    server.on("error", (err) => {
      logger.error("Server error:", err);
      reject(err);
    });
  });
}

async function createServer({
  port = 8080,
  address = "127.0.0.1",
  withCleanup = false,
  withPersistence = false,
  persistencePath = null,
  resetPersistence = false,
} = {}) {
  const { store, storeCleaner } = createStore(
    withCleanup,
    withPersistence || persistencePath,
    persistencePath,
    resetPersistence
  );
  const socket = await createTCPServer(store, port, address);
  const close = () => {
    logger.debug(`server close`);
    storeCleaner?.stopCleanup();
    socket.close();
  };

  if (sigintHandled === false) {
    process.on("SIGINT", function () {
      console.log("\nSIGINT...");
      close();
      process.exit();
    });
    sigintHandled = true;
  }

  return { store, socket, close };
}

export { createServer };
