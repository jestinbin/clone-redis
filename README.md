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
	```