let config = {};

// 是否为开发模式
config.debug = true;
// 客户端版本号
config.version = '0.0.1';
// 服务器配置
config.server = {
	// 服务器地址
	url: '',
	// 重连次数上限
	reconnLimit: 5,
};

// 不打印日志的接收命令
config.notlog_recv = [0];

// 不打印日志的接收命令
config.notlog_send = [0];

module.exports = config;
