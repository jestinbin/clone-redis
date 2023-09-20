# clone-redis

- `npm ci`
- (terminal 1)
	- `npm run start:server`
- (terminal 2)
	```
	▶ nc 127.0.0.1 8080
	connected
	set:5:"foo":3:100
	true
	get:5:"foo"
	100
	set:5:"foo":3:"1"
	true
	get:5:"foo"
	"1"
	del:5:"foo"
	true
	get:5:"foo"
	undefined
	blpop:5:"boo"
	... waiting for rpush ...
	11
	```
- (terminal 3)
	```
	▶ nc 127.0.0.1 8080
	connected
	rpush:5:"boo":2:11
	true
	```

## Examples

### queue

- terminal 1: start server `npm run start:server`
- terminal 2: start consumer 1 `node examples/queue/consumer.js` (2 elements per seconds)
- terminal 3: start producer `node examples/queue/publisher.js` (3 elements per seconds)
- terminal 4: start consumer 2 `node examples/queue/consumer.js` (2 elements per seconds)
