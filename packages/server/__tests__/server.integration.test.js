import { jest } from "@jest/globals";
import net from "net";
import { createServer } from "../../server/index.js";

describe("TCP Server e2e tests", () => {
  let server;
  let client1;
  let client2;
  let client3;

  const connectClient = () =>
    new Promise((resolve, reject) => {
      const client = new net.Socket();
      client.connect(8080, "127.0.0.1");
      client.once("data", (data) => {
        if (data.toString().trim() === "connected") {
          resolve(client);
        } else {
          reject(
            new Error("Expected 'connected' message on client connection.")
          );
        }
      });
    });

  beforeEach(async () => {
    server = createServer();
    client1 = await connectClient();
    client2 = await connectClient();
    client3 = await connectClient();
  });

  afterEach(() => {
    client1.destroy();
    client2.destroy();
    client3.destroy();
    server.close();
  });

  const sendRequest = (message, client = client1) =>
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
    expect(await sendRequest("xxxxxx")).toMatch(/^error/);
  });

  it("should allow one client to synchronously read and remove an item pushed by another client", async () => {
    expect(await sendRequest('rpush:5:"foo":3:100', client1)).toBe("true");
    expect(await sendRequest('blpop:5:"foo"', client2)).toBe("100");
  });

  it("should allow one client to asynchronously read and remove an item after it's pushed by another client", async () => {
    const blpopPromise = sendRequest('blpop:5:"foo"', client1);
    expect(await sendRequest('rpush:5:"foo":3:100', client2)).toBe("true");
    expect(await blpopPromise).toBe("100");
  });

  it("should allow two clients to asynchronously wait for new items produced by another client", async () => {
    let firstRPushSent = false;
    let secondRPushSent = false;

    const blpopPromise1 = sendRequest('blpop:5:"foo"', client1).then(
      (result) => {
        expect(firstRPushSent).toBe(true);
        expect(result).toBe("101");
      }
    );

    const blpopPromise2 = sendRequest('blpop:5:"foo"', client2).then(
      (result) => {
        expect(secondRPushSent).toBe(true);
        expect(result).toBe("102");
      }
    );

    firstRPushSent = true;
    expect(await sendRequest('rpush:5:"foo":3:101', client3)).toBe("true");
    await blpopPromise1;

    secondRPushSent = true;
    expect(await sendRequest('rpush:5:"foo":3:102', client3)).toBe("true");
    await blpopPromise2;
  });
});
