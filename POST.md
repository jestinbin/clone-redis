

# What?

Create a redis lite, json based, version, implementing some of the core features, like:
- get/set commands
- in-memory data structures: strings, lists
- blocking commands
- publish-subscriber

Features that will not be implemented: persistence, high availability, clustering, etc..

The api will be the same as the [node-redis module](https://github.com/redis/node-redis), for example:
```js
import { createClient } from 'redis';
const client = createClient();
...
await client.set('key', 'value');
const value = await client.get('key');
...
import { commandOptions } from 'redis';
const blPopPromise = client.blPop(
  commandOptions({ isolated: true }),
  'key',
  0
);
await client.lPush('key', ['1', '2']);
await blPopPromise; // '2'
...
await client.publish('channel', 'message');
await client.unsubscribe();
```

It will be a semplified json based version of the [RESP protocol](https://redis.io/docs/reference/protocol-spec/). The following are the data types we are interested in:
```bash
strings
integers
arrays
nulls
booleans
```


# How?

Create 2 packages:
- `server`, the redis server counterpart, in nodejs
- `sdk`, the nodejs redis module counterpart

`nc` (or `netcat`) it can be used to test communication with the server via the terminal, for example `nc 127.0.0.1 8080`.


# Todos

- [ ] handle argument keys and changing positions like redis `SET key value [NX | XX] [GET] ...`; [link](https://redis.io/commands/set/)
- [ ] use a delimiter (e.g., '\n') for sending messages, buffer incoming data on the receiving side until the delimiter is detected, and then process the buffered message. This approach remains independent of socket-level `buffering` behavior.
- [ ] handle blocking command like blpop
- [ ] develop publish/subscribe commands
- [ ] enable and test the expired keys cleanup
- [ ] integrate a simple solution for saving data to disk (to decide: log or flush from memory?)





# Analysis

## ...





# References & Notes

## performance

Simply commenting out the logger.debug lines, performance improves a lot.

- terminal 1: `npm run start:server`
- terminal 2: `node examples/bench.js`

from
```
mine/jestinbin/clone-redis  main ✗                                                                                                      1m ⚑ ◒  
▶ node examples/bench.js
Connected to the server
Requests made: 71803
Total duration: 5.00 seconds
Requests per second: 14360.60
```

to
```
▶ node examples/bench.js
Connected to the server
Requests made: 133893
Total duration: 5.00 seconds
Requests per second: 26778.60
```


## https://github.com/redis/node-redis

For the api.


## https://redis.io/docs/management/optimization/benchmarks/


```bash
$ redis-benchmark -n 100000 -q script load "redis.call('set','foo','bar')"  
script load redis.call('set','foo','bar'): 69881.20 requests per second  
```


> To really test Redis, you need multiple connections (like redis-benchmark) and/or to use pipelining to aggregate several commands and/or multiple threads or processes. 

> CPU is another very important factor. Being single-threaded, Redis favors fast CPUs with large caches and not many cores.  


## https://redis.io/docs/reference/protocol-spec/#resp-simple-strings


```
RESP is a compromise among the following considerations:
- Simple to implement.
- Fast to parse.
- Human readable.
```

The same observations are rilevant to the very simple (probably wrong) protocol realized for this clone project.


## https://redis.io/commands/expire/

> Redis keys are expired in two ways: a passive way, and an active way.

> A key is passively expired simply when some client tries to access it, and the key is found to be timed out.

> ... periodically Redis tests a few keys at random among keys with an expire set.


