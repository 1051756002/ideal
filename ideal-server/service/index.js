/**
 * 业务服务器
 * 用于解读客户端发送过来的请求，分发出业务指令。
 */
let service = {
	// 源数据, 存放业务子体系
	_source: {},
};

let serviceList = [];
for (let k in service) {
	serviceList.push(service[k]);
};

// 发送指令
service.send = function(type, data) {
	let exist = false;
	for (let i = 0; i < serviceList.length; i++) {
		exist = serviceList[i].send(type, data);
		if (exist) { break; }
	}

	if (!exist) {
		util.warn('WARN: %s not sent.', type);
	}
};

// 解析消息
service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	let exist = false;
	for (let i = 0; i < serviceList.length; i++) {
		exist = serviceList[i].parseMsg(mainCmd, subCmd, bodyBuff);
		if (exist) { break; }
	}

	if (!exist) {
		util.warn('WARN: { main: %d, sub: %d } not parsing.', mainCmd, subCmd);
	}
};

// 初始化业务服务器
service.init = function(callback) {
	let walk = require('walkdir');

	util.log('%-cyan', '  service loaded start.');
	// 遍历本目录下的所有子体系
	walk.sync('./service', function(path, stats) {
		// 非js文件过滤掉
		if (!/.*\.js$/.test(path)) {
			return;
		}

		let arr = path.split('\\');
		arr = arr.splice(arr.lastIndexOf('service') + 1);

		// 重定义文件名, 且用来做业务键值
		let fname = arr.join('.');

		// 过滤掉自身文件
		if (fname == 'index.js') {
			return;
		}

		service._source[fname] = require(path);

		util.logat('%-gray', '  - loaded file: {1}', path);
		util.logat('%-gray', '    define as {1}', fname);
	});
	util.log('%-cyan', '  service loaded complete.\n');

	util.isDefine(callback) && callback();
};

module.exports = service;
