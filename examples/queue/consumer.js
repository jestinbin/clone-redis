import { createClient } from "./../../packages/sdk/index.js";
import sleep from "./sleep.js";

const client = await createClient();

const processId = process.pid;

while (true) {
  const value = await client.blpop("foo", 123);
  console.log(`[consumer-${processId}] value: ${value}`);
  await sleep(500);
}
