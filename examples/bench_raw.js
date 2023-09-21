import net from "net";

// TCP server configuration
const SERVER_HOST = "127.0.0.1";
const SERVER_PORT = 8080;

// Test duration and number of requests made
const DURATION = 5; // in seconds
let requestCount = 0;

// Create a persistent connection
const client = net.createConnection(SERVER_PORT, SERVER_HOST, () => {
  console.log("Connected to the server");
  loop();
});

client.on("data", (data) => {
  requestCount++;
  if ((Date.now() - startTime) / 1000 < DURATION) {
    sendRequest();
  } else {
    endBench();
  }
});

client.on("error", (error) => {
  console.error("Error during connection:", error);
});

let startTime;

function sendRequest() {
  client.write(`set:5:"foo":3:100\n`);
}

function endBench() {
  const totalTime = (Date.now() - startTime) / 1000;
  const avgRequestsPerSecond = requestCount / totalTime;
  console.log(`Requests made: ${requestCount}`);
  console.log(`Total duration: ${totalTime.toFixed(2)} seconds`);
  console.log(`Requests per second: ${avgRequestsPerSecond.toFixed(2)}`);
  client.end();
}

// Main function
function loop() {
  startTime = Date.now();
  sendRequest();
}
