import { createClient } from "../packages/sdk/index.js";
import { createServer } from "../packages/server/index.js";

const server = await createServer({ withPersistence: false });
const client = await createClient();

const types = [
  ["str", "string"],
  ["integer", 100],
  ["float", 100.999],
  ["boolean true", true],
  ["boolean false", false],
  ["null", null],
  ["object", { a: 123 }],
  ["array", [1, "2", { value: 3 }]],
];

for (const [key, value] of types) {
  try {
    await client.set(key, value);
    console.log(`${key}: `, await client.get(key));
  } catch (error) {
    console.error(error);
  }
}

client.close();
server.close();
