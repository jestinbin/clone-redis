import { createClient } from "../../packages/sdk/index.js";
import sleep from "../utils/sleep.js";

const client = await createClient();

const processId = process.pid;

client.subscribe("foo", (err, value) => {
  console.log(`[subscriber-${processId}] value: ${value}`);
});
