import { jest } from "@jest/globals";
import Command from "../../commons/Command.js";
import { createClient } from "../index.js";
import net from "net";

describe("SDK integrations tests", () => {
  let server;
  let client;

  function createServer() {
    const server = net.createServer((socket) => {
      socket.write("connected\n");
    });
    server.listen(8080);
    return server;
  }

  beforeEach(async () => {
    server = createServer();
    client = await createClient();
  });

  afterEach(() => {
    client.close();
    server.close();
  });

  it("should implement the expected interface", async () => {
    const expectedMethods = [
      "get",
      "set",
      "del",
      "rpush",
      "blpop",
      "close",
      "publish",
      "subscribe",
    ];
    expectedMethods.forEach((method) => {
      expect(typeof client[method]).toBe("function");
    });
  });
});
