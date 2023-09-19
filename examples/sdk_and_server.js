import sdk from "./../packages/sdk/index.js";
import { bootstrap } from "./../packages/server/index.js";

bootstrap();

const client = await sdk.createClient();

await client.set("foo", 123, 2);

console.log(await client.get("foo"));

await new Promise((res) => setTimeout(() => res(), 3000));

console.log(await client.get("foo"));
