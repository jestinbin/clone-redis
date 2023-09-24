import { jest } from "@jest/globals";
import { createServer } from "../server/index.js";
import { createClient } from "../sdk/index.js";
import fs from "fs";

const logFilePath = "./tmp/e2e-with-persistence.log";

// TODO: merge with packages/server/utils.js
function readLogFile(logFilePath) {
  if (fs.existsSync(logFilePath)) {
    const content = fs.readFileSync(logFilePath, "utf-8");
    const logs = content.split("\n").filter((line) => line.trim() !== "");
    return logs;
  } else {
    return [];
  }
}

// TODO: merge with packages/server/utils.js
function deleteFile(logFilePath) {
  if (fs.existsSync(logFilePath)) {
    fs.unlinkSync(logFilePath);
  }
}

describe("SDK integrations tests", () => {
  let server;
  let client;

  beforeAll(() => {
    deleteFile(logFilePath);
  });

  beforeEach(async () => {
    server = await createServer({ persistencePath: logFilePath });
    client = await createClient();
  });

  afterEach(() => {
    server.close();
    deleteFile(logFilePath);
  });

  it("should verify that the persistence file has the correct content after restore data", async () => {
    expect(await client.set("foo1", 101)).toBe(true);
    expect(await client.set("foo2", 102)).toBe(true);
    expect(await client.set("foo3", 103)).toBe(true);
    expect(await client.get("foo1")).toBe(101);
    expect(await client.get("foo2")).toBe(102);
    expect(await client.get("foo3")).toBe(103);
    expect(await client.del("foo1")).toBe(true);
    expect(await client.get("foo1")).toBe(undefined);

    client.close();
    server.close();

    // re-start to trigger the restore data with compactLog procedure
    server = await createServer({ persistencePath: logFilePath });

    const logs = readLogFile(logFilePath);

    expect(logs).toHaveLength(2);

    expect(JSON.parse(logs[0])).toMatchObject({
      name: "_set",
      args: ["foo2", 102, -1],
    });
    expect(JSON.parse(logs[1])).toMatchObject({
      name: "_set",
      args: ["foo3", 103, -1],
    });
  });
});
