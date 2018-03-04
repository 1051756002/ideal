let ideal = {};

ideal.util = require('../util/util');
ideal.config = require('./config');
ideal.protobuf = require('./protobuf');
ideal.conn = require('../network/connector');

window.$ = require('jquery');
window.ideal = ideal;
window.util = ideal.util;
window.config = ideal.config;
window.protobuf = ideal.protobuf;

// 禁止引擎日志输出
window.console.timeEnd = function() {};

// 初始化架构
ideal.init = function(callback) {
	util.clear();
	// 加载protobuf
	protobuf.init(function() {
		// ideal.conn.connect();
		util.logat('%-#0fe029', 'Version: {1}', config.version);
		util.logat('%-#0fe029', 'DebugModel: {1}\n', config.debug);
		util.isDefine(callback) && callback();
	});
};

ideal.init(function() {
	util.log('%-#0fe029', 'ideal framework initialization end.');
});
