import { createClient } from "./../../packages/sdk/index.js";
import sleep from "./sleep.js";

const client = await createClient();

let count = 0;

while (true) {
  await client.rpush("foo", count++);
  console.log(`[producer] new value: ${count}`);
  const queue = await client.get("foo");
  console.log(`[producer] queue: ${queue}`);
  await sleep(333);
}
