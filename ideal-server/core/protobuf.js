let protobuf = {};
let protobufjs = require('protobufjs');

let loadNext = function(idx = 0, callback = null) {
	let plist = util.clone(config.protolist);
	if (idx >= plist.length) {
		util.isDefine(callback) && callback();
		return;
	}

	let file = 'Unnamed';
	let path = plist[idx];
	let result = path.match(/\/([a-z|_|-]*)\.proto/i);
	if (util.isDefine(result)) {
		file = result[1];
	};

	protobufjs.load(path, function(err, root) {
		if (err) {
			util.log(err);
			return;
		}
		protobuf[file] = root;
		util.logat('%-cyan', '  - loaded file: {1}, define as {2}', path, file);
		loadNext(idx + 1, callback);
	});
};

protobuf.init = function(callback) {
	util.log('%-cyan', '  protobuf loaded start.');
	loadNext(0, function() {
		util.log('%-cyan', '  protobuf loaded complete.\n\n');
		util.isDefine(callback) && callback();
	});
};

module.exports = protobuf;
