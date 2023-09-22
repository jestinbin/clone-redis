
[![Run npm tests](https://github.com/jestinbin/clone-redis/actions/workflows/run-tests.yml/badge.svg)](https://github.com/jestinbin/clone-redis/actions/workflows/run-tests.yml)

# clone-redis

A simplified, incomplete, json-based `redis` clone.

Developed in `node.js`.

This projects contains:
- a `server`: the counterpart to the redis server
- an `sdk`: the counterpart to the node.js redis module
- a `test suite` for every package and another for e2e tests

Note: `nc` (or `netcat`) can be used to test communication with the server via the terminal, e.g., `nc 127.0.0.1 8080`

## Features

- Simplified versions of some of the `basic commands`: get, set, delete
- Allows the use of any value valid in `JSON`
- Key `expiration` management: both passive and periodic/active
- A simple JSON-based `protocol` that can handle variable-length strings
- Blocking commands for a basic `queue` implementation
- `pubsub` commands
- `Log-based` persistence


## Getting started

- install the dependencies `npm ci`
- activate the server `npm run start:server`
- then, write a simple client with the sdk

```js
import { createClient } from "./../packages/sdk/index.js";
import sleep from "./utils/sleep.js";

const client = await createClient();

await client.set("foo", 123, 1); // 1 second of expiration time

console.log("before expiration time", await client.get("foo"));

await sleep(2000);

console.log("after expiration time", await client.get("foo"));

client.close();

// before expiration time 123
// after expiration time undefined
```



## Examples

- **sdk_and_server**: a getting started with the sdk and server
- **pubsub**: simulate pubsub behaviour using the publish and subscribe commands (similar to redis but simplified)
	- launch `./examples/queue/launcher.sh`: opens 4 terminal: server, publisher and 2 subscribers
	- note: the launcher has only been tested on MacOS
- **queue**: simulate a queue behaviour with rpush and blpop commands (similar to redis but simplified)
	- launch `./examples/queue/launcher1.sh`: opens 3 terminal: server, producer and consumer
	- launch `./examples/queue/launcher2.sh`: opens an additional consumer. You can repeat this as many times as desired
	- note: the launcher has only been tested on MacOS
- **bench_raw**: a simple benchmark to determine requests per second throughput. The server is real, while the client is mocked
- **bench_sdk**: similiar to bench_raw, but the client uses the sdk code



## Todos

- [x] handle blocking command like blpop
- [x] develop publish/subscribe commands
- [x] enable and test the expired keys cleanup
- [ ] integrate a simple solution for saving data to disk (to decide: log or flush from memory?)
- [ ] use a delimiter (e.g., '\n') for sending messages, buffer incoming data on the receiving side until the delimiter is detected, and then process the buffered message. This approach remains independent of socket-level `buffering` behavior.
  - [ ] re-enable Nagle's algorithm on the TCP connection used for message grouping (remove `setNoDelay(true)`)



