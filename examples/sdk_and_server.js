import { createClient } from "./../packages/sdk/index.js";
import { createServer } from "./../packages/server/index.js";

const server = createServer();
const client = await createClient();

await client.set("foo", 123, 1);

console.log(await client.get("foo"));

await new Promise((res) => setTimeout(() => res(), 2000));

console.log(await client.get("foo"));

client.close();
server.close();
