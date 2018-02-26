/**
 * 业务服务器
 * 用于解析服务器推送过来的消息，分发出业务指令。
 */
let service = {
	// 登录模块
	login: require('./service-login')
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

module.exports = service;
