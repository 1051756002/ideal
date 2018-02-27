let ideal = {};

ideal.util = require('../util/util');
ideal.config = require('./config');
ideal.protobuf = require('./protobuf');
ideal.conn = require('../network/connector');

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
        var xhr = cc.loader.getXMLHttpRequest();
        // this.streamXHREventsToLabel(xhr, this.xhrAB, this.xhrABResp, "POST");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                util.log(xhr.responseText);
            }
        };

        xhr.open("POST", "http://192.168.1.120:3000/login");
        xhr.setRequestHeader("Content-Type","text/plain");
        xhr.send(JSON.stringify({
        	u: 10086,
        	p: 'superman',
        }));

		// ideal.conn.connect();
		util.logat('%-#0fe029', 'Version: {1}', config.version);
		util.logat('%-#0fe029', 'DebugModel: {1}\n', config.debug);
		util.isDefine(callback) && callback();
	});
};

ideal.init(function() {
	util.log('%-#0fe029', 'ideal framework initialization end.');
});
