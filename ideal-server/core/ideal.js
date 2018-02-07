let ideal = {};

ideal.util = require('../util/index');
ideal.config = require('./config');
ideal.protobuf = require('./protobuf');

// 定义全局命名空间
global.ideal = ideal;
global.util = ideal.util;
global.config = ideal.config;
global.protobuf = ideal.protobuf;

// 初始化
ideal.init = function(callback) {
	util.clear();
	protobuf.init(function() {
		// util.log('ws://%s:%d', config.server.host, config.server.port);
		// util.log('redis: %s', config.redis.enable);
		// util.log('debug: %s', config.debug);
		// util.log('Server is starting ...');
		// util.log('\r\n\r\n');

		util.logat('%-green', '  Version: {1}', config.version);
		util.logat('%-green', '  DebugModel: {1}', config.debug);
		util.isDefine(callback) && callback();
	});
};

