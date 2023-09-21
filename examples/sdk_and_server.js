import sdk from "./../packages/sdk/index.js";
import { createServer } from "./../packages/server/index.js";

createServer();

const client = await sdk.createClient();

await client.set("foo", 123, 2);

console.log(await client.get("foo"));

await new Promise((res) => setTimeout(() => res(), 3000));

console.log(await client.get("foo"));
