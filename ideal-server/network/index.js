let network = {};

// 通讯监听
let listen = function(client) {
	// 分发指令
	client.on('message', function(buffer) {
		// service.call(client, buffer);
		util.log('recv: ', buffer);
	});

	// 用户断线
	client.on('close', function() {
		// service.call(client, new Buffer([2, 1, 5]));
		util.log('disconn', client);
	});
};

// 初始化网络
network.init = function(callback) {
	let ws = require('ws');
	let server = require('http').createServer();

	let wss = new ws.Server({
		server: server,
		verifyClient: require('./verify'),
	});

	wss.on('connection', listen);

	server.allowHalfOpen = false;
	server.listen(config.server.port, config.server.address);

	util.log('%-green', '  ServerUrl: ws://%s:%d', config.server.address, config.server.port);
	util.log('%-green', '  Server is starting ...\n');
	util.isDefine(callback) && callback();
};

module.exports = network;
