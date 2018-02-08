let config = {};

// 是否为开发模式
config.debug = true;
// 客户端版本号
config.version = '0.0.1';
// 服务器配置
config.server = {
	// 地址
	// address: '192.168.1.120',
	address: '192.168.199.195',
	// 端口
	port: 5555,
	// 重连次数上限
	reconnLimit: 5,
};

// 不打印日志的接收命令
config.notlog_recv = [0];

// 不打印日志的接收命令
config.notlog_send = [0];

// proto文件列表
config.protolist = ['./proto/MsgSocketProtoBean.proto'];

module.exports = config;
