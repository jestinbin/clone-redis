import net from "net";
import { bootstrap } from "./../index.js";

describe("TCP Server e2e tests", () => {
  let server;
  let client;

  const connectClient = () =>
    new Promise((resolve, reject) => {
      client.connect(8080, "127.0.0.1");
      client.once("data", (data) => {
        if (data.toString().trim() === "connected") {
          resolve();
        } else {
          reject(
            new Error("Expected 'connected' message on client connection.")
          );
        }
      });
    });

  beforeEach(async () => {
    const { socket } = bootstrap();
    server = socket;

    client = new net.Socket();
    await connectClient();
  });

  afterEach(() => {
    client.destroy();
    server.close();
  });

  const sendRequest = (message) =>
    new Promise((resolve, reject) => {
      client.once("data", (data) => resolve(data.toString().trimEnd()));
      client.write(`${message}\n`);
    });

  it("should set, get, and delete keys", async () => {
    expect(await sendRequest('set:5:"foo":3:100')).toBe("true");
    expect(await sendRequest('get:5:"foo"')).toBe("100");
    expect(await sendRequest('set:5:"foo":3:"1"')).toBe("true");
    expect(await sendRequest('get:5:"foo"')).toBe('"1"');
    expect(await sendRequest('del:5:"foo"')).toBe("true");
    expect(await sendRequest('get:5:"foo"')).toBe("undefined");
  });

  it("should return an 'error' response for an unrecognized command", async () => {
    expect(await sendRequest("xxxxxx")).toBe('"error"');
  });
});
