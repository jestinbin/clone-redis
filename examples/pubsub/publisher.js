import { createClient } from "../../packages/sdk/index.js";
import sleep from "../utils/sleep.js";

const client = await createClient();

let count = 0;

while (true) {
  await client.publish("foo", count++);
  console.log(`[producer] new value: ${count}`);
  await sleep(1000);
}
