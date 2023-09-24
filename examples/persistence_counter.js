import { createClient } from "../packages/sdk/index.js";
import { createServer } from "../packages/server/index.js";

const server = await createServer({ withPersistence: true });
const client = await createClient();

let counter = (await client.get("foo")) || 0;

await client.set("foo", ++counter, 5);

console.log("counter value", await client.get("foo"));

client.close();
server.close();
