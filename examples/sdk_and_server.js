import { createClient } from "./../packages/sdk/index.js";
import { createServer } from "./../packages/server/index.js";
import sleep from "./utils/sleep.js";

const server = await createServer();
const client = await createClient();

await client.set("foo", 123, 1); // 1 second of expiration time

console.log("before expiration time", await client.get("foo"));

await sleep(2000);

console.log("after expiration time", await client.get("foo"));

client.close();
server.close();
