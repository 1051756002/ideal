let ideal = {};

ideal.util = require('../util/index');
ideal.config = require('./config');
ideal.protobuf = require('./protobuf');
ideal.network = require('../network');
ideal.service = require('../service');

// 定义全局命名空间
global.ideal = ideal;
global.util = ideal.util;
global.config = ideal.config;
global.protobuf = ideal.protobuf;
global.network = ideal.network;
global.service = ideal.service;

// 初始化架构
ideal.init = function(callback) {
	util.clear();
	// 加载protobuf
	protobuf.init(function() {
		// 初始化业务服务器
		service.init(function() {
			// 启动服务器
			network.init(function() {
				util.logat('%-green', '  Version: {1}', config.version);
				util.logat('%-green', '  DebugModel: {1}\n', config.debug);
				util.isDefine(callback) && callback();
			});
		});
	});
};

