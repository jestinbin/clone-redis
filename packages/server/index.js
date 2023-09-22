import net from "net";
import commandProcessorInit from "./processor.js";
import Store from "./store/store.js";
import StoreCleaner from "./store/storeCleaner.js";
import logger, { configLogger } from "../commons/logger.js";

configLogger({
  level: "info",
  name: "server",
});

let sigintHandled = false;

function createStore() {
  const store = new Store();
  const storeCleaner = new StoreCleaner(store, 50);
  storeCleaner.startCleanupInterval();
  return { store, storeCleaner };
}

function createTCPServer(store, port, address) {
  const server = net.createServer((socket) => {
    socket.setNoDelay(true);

    logger.debug(
      "Client connected:",
      socket.remoteAddress + ":" + socket.remotePort
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
        // logger.debug("new data: " + request.toString());
        processor(request);
      } catch (error) {
        logger.error(error);
        outErrorFn(error);
      }
    });

    socket.on("end", () => {
      logger.debug("Client disconnected");
    });

    socket.write("connected\n");
    // socket.pipe(socket);
  });

  server.listen(port, address, () => {
    logger.debug(`TCP server running on ${address}:${port}`);
  });

  server.on("error", (err) => {
    logger.error("Server error:", err.message);
  });

  return server;
}

function createServer({ port = 8080, address = "127.0.0.1" } = {}) {
  const { store, storeCleaner } = createStore();
  const socket = createTCPServer(store, port, address);
  const close = () => {
    storeCleaner?.stopCleanupInterval();
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
