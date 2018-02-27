let network = {};

// 通讯监听
let listen = function(client) {
	// 分发指令
	client.on('message', function(buffer) {
		// service.call(client, buffer);
		util.log('recv: ', buffer);

		if (!buffer instanceof ArrayBuffer) {
			util.log('不是正确格式');
			return;
		}

		// 消息头部
		let msgHead = new Uint8Array(buffer, 0, 2);
		// 消息命令部分
		let msgCmd = new Uint16Array(buffer, 2, 4);
		// 消息参数
		let msgBody = new Uint8Array(buffer, 10);

		let mainCmd = msgCmd[2];
		let subCmd = msgCmd[3];
		let bodyBuff = new Uint8Array(msgBody);

		util.log('mainCmd: {1}, subCmd: {2}', mainCmd, subCmd);
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

	util.log('%-green', '  ServerUrl: ws://%s:%d', config.server[1].address, config.server[1].port);

	server.allowHalfOpen = false;
	server.listen({
		port: config.server[1].port,
		host: config.server[1].address
	}, function() {
		util.log('%-green', '  Server is starting ...\n');
		util.isDefine(callback) && callback();
	});
};

module.exports = network;
