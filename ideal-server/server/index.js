let ws = require('ws');
let router = require('./router');
let server = require('http').createServer();

let wss = new ws.Server({
	server: server,
	verifyClient: require('./verify'),
});

wss.on('connection', function(client) {
	// 分发指令
	client.on('message', function(buffer) {
		router.call(client, buffer);
	});

	// 用户断线
	client.on('close', function() {
		router.call(client, new Buffer([2, 1, 5]));
	});
});
