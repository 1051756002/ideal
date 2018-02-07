let _util = {};

// 控制平台打印日志
_util.log = function() {
	if (!config.debug) {
		return;
	}
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	console.log.apply(console, args);
};

// 控制平台打印日志, 采用format模式(占位符)
_util.logat = function() {
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	util.log(util.format.apply(util, args));
};

// 控制平台打印警告
_util.warn = function() {
	if (!config.debug) {
		return;
	}
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	console.warn.apply(console, args);
};

// 清空控制台消息
_util.clear = function() {
	let content;
	if (process.platform === 'win32') {
		content = '\x1Bc';
	} else {
		content = '\x1B[2J\x1B[3J\x1B[H';
	}
	process.stdout.write(content);
};

module.exports = _util;
