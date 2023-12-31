import { createClient } from "../../packages/sdk/index.js";
import sleep from "../utils/sleep.js";

const client = await createClient();

const processId = process.pid;

while (true) {
  const value = await client.blpop("foo");
  console.log(`[consumer-${processId}] value: ${value}`);
  await sleep(500);
}
