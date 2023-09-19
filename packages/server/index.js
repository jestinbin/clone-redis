import net from "net";
import commandProcessorInit from "./processor.js";
import Store from "./store/store.js";
import StoreCleaner from "./store/storeCleaner.js";
import logger, { configLogger } from "../commons/logger.js";

configLogger({
  level: "info",
  name: "server",
});

function createStore() {
  const store = new Store();
  // const storeCleaner = new StoreCleaner(store);
  return store;
}

function createTCPServer(store, port, address) {
  const server = net.createServer((socket) => {
    logger.debug(
      "Client connected:",
      socket.remoteAddress + ":" + socket.remotePort
    );

    const outFn = (message) => {
      let out = message;
      if (message === undefined) {
        out = "undefined";
      }
      socket.write(`${JSON.stringify(out)}\n`);
    };

    const processor = commandProcessorInit(store, outFn);

    socket.on("data", (request) => {
      try {
        logger.debug("new data: " + request.toString());
        processor(request);
      } catch (error) {
        logger.error(error);
        outFn(`error`); // TODO: to improve
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

function bootstrap({ port = 8080, address = "127.0.0.1" } = {}) {
  const store = createStore();
  const socket = createTCPServer(store, port, address);
  return { store, socket };
}

export { bootstrap };
