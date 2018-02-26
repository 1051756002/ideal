let _util = {};

_util.requireDir = function(dirName) {
	let walk = require('walkdir');
	let path = require('path');
	let obj = {};

	walk.sync(dirName, function(pathName, stats) {
		let fileName = pathName.split(path.sep).pop();
		let lastIdx = fileName.lastIndexOf('.');

		if (lastIdx > -1) {
			obj[fileName.slice(0, lastIdx)] = require(pathName);
		}
	});

	return obj;
};

// 是否为空对象
_util.isEmpty = function(val) {
	switch (typeof(val)) {
		case 'string':
			return util.trim(val).length == 0 ? true : false;
			break;
		case 'number':
			return val == 0;
			break;
		case 'object':
			return val == null;
			break;
		case 'array':
			return val.length == 0;
			break;
		case 'function':
			return false;
			break;
		default:
			return true;
	}
};

// 是否定义了该内容
_util.isDefine = function(val) {
	return !util.isEmpty(val);
};

module.exports = _util;
