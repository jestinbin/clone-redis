

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

- [ ] ...



# Analysis

## ...

...



# References & Notes


## https://github.com/redis/node-redis

For the api.


## https://en.wikipedia.org/wiki/Token_bucket#Algorithm

Contains the Token Bucket pseudocode.


## https://kendru.github.io/javascript/2018/12/28/rate-limiting-in-javascript-with-a-token-bucket/

> A token bucket is an algorithm that allows tokens to be accumulated over time at a specific rate.  
> These tokens can then be “redeemed” to execute some action.  
> If there are no tokens available, the action cannot be taken.  

Contains a timer-free Token Bucket implementation that I've used as main reference.





