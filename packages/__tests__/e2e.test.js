import { jest } from "@jest/globals";
import { createServer } from "../server/index.js";
import { createClient } from "../sdk/index.js";

describe("SDK integrations tests", () => {
  let server;
  let client1;
  let client2;
  let client3;

  beforeEach(async () => {
    server = createServer();
    client1 = await createClient();
    client2 = await createClient();
    client3 = await createClient();
  });

  afterEach(() => {
    client1.close();
    client2.close();
    client3.close();
    server.close();
  });

  it("should allow clients to set, get, and delete keys", async () => {
    expect(await client1.set("foo", 100)).toBe(true);
    expect(await client2.get("foo")).toBe(100);
    expect(await client1.set("foo", "1")).toBe(true);
    expect(await client2.get("foo")).toBe("1");
    expect(await client1.del("foo")).toBe(true);
    expect(await client2.get("foo")).toBe(undefined);
  });

  it("should allow client to set expiration time", async () => {
    expect(await client1.set("foo", 100, 1)).toBe(true);
    expect(await client2.get("foo")).toBe(100);
    await new Promise((res) => setTimeout(() => res(), 1200));
    expect(await client2.get("foo")).toBe(undefined);
  });
});
