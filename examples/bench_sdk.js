import { createServer } from "./../packages/server/index.js";
import { createClient } from "./../packages/sdk/index.js";

const server = createServer();
const client = await createClient();

let startTime;
let requestCount = 0;
let hasFinished = false;
let interval;

function endBench() {
  const totalTime = (Date.now() - startTime) / 1000;
  const avgRequestsPerSecond = requestCount / totalTime;
  console.log(`Requests made: ${requestCount}`);
  console.log(`Total duration: ${totalTime.toFixed(2)} seconds`);
  console.log(`Requests per second: ${avgRequestsPerSecond.toFixed(2)}`);
  client.close();
  server.close();
}

async function start() {
  startTime = Date.now();
  while (requestCount < 100 * 1000) {
    await client.set("foo", ++requestCount);
  }
  endBench();
}

await start();
