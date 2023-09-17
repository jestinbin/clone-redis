import net from "net";
import commandProcessorInit from "./command/processor.js";
import createResponse from "./response/createResponse.js";
import Store from "./store/store.js";
import StoreCleaner from "./store/storeCleaner.js";

function createStore() {
  const store = new Store();
  // const storeCleaner = new StoreCleaner(store);
  return store;
}

function createTCPServer(store, port, address) {
  const server = net.createServer((socket) => {
    console.log(
      "Client connected:",
      socket.remoteAddress + ":" + socket.remotePort
    );

    const processor = commandProcessorInit(store, createResponse(socket));
    socket.on("data", (request) => {
      try {
        processor(request);
      } catch (error) {
        // TODO: log error
        console.error(error);
      }
    });

    socket.on("end", () => {
      console.log("Client disconnected");
    });

    socket.write("connected\n");
    // socket.pipe(socket);
  });

  server.listen(port, address, () => {
    console.log(`TCP server running on ${address}:${port}`);
  });

  server.on("error", (err) => {
    console.error("Server error:", err.message);
  });

  return server;
}

function bootstrap({ port = 8080, address = "127.0.0.1" } = {}) {
  const store = createStore();
  const socket = createTCPServer(store, port, address);
  return { store, socket };
}

export { bootstrap };
