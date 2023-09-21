import { createClient } from "./../packages/sdk/index.js";
import { createServer } from "./../packages/server/index.js";

const server = createServer();
const client1 = await createClient();
const client2 = await createClient();
const client3 = await createClient();

client1.subscribe("foo", (err, value) => {
  console.log(`client1: ${value}`);
});

client2.subscribe("foo", (err, value) => {
  console.log(`client2: ${value}`);
});

await client3.publish("foo", 100);

client1.close();
client2.close();
client3.close();
server.close();
