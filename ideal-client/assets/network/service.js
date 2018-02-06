/**
 * 业务服务器
 * 用于解析服务器推送过来的消息，分发出业务指令。
 */
let service = {
	// 登录模块
	// login: require('./service_login'),
	// 聊天模块
	// chat: require('./service_chat'),
	// 红包模块
	// pocket: require('./service_pocket'),
	// 问答模块
	// qa: require('./service_qa'),
	// 黄金15秒模块
	// pt: require('./service_pt'),
};

let service_arr = [];
for (let k in service) {
	service_arr.push(service[k]);
};

// 发送指令
service.send = function(type, data) {
	let exist = false;
	for (let i = 0; i < service_arr.length; i++) {
		exist = service_arr[i].send(type, data);
		if (exist) { break; }
	}

	if (!exist) {
		util.warn('WARN: %s not sent.', type);
	}
};

// 解析消息
service.parseMsg = function(mainCmd, subCmd, bodyBuff) {
	let exist = false;
	for (let i = 0; i < service_arr.length; i++) {
		exist = service_arr[i].parseMsg(mainCmd, subCmd, bodyBuff);
		if (exist) { break; }
	}

	if (!exist) {
		util.warn('WARN: { main: %d, sub: %d } not parsing.', mainCmd, subCmd);
	}
};

module.exports = service;
