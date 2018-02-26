let protobuf = {};
let protobufjs = require('protobufjs');

let loadNext = function(idx = 0, callback = null) {
	let plist = util.clone(config.protolist);
	if (idx >= plist.length) {
		util.isDefine(callback) && callback();
		return;
	}

	let fname = 'Unnamed';
	let path = plist[idx];
	let result = path.match(/\/([a-z|_|-]*)\.proto/i);
	if (util.isDefine(result)) {
		fname = result[1];
	};

	protobufjs.load(path, function(err, root) {
		if (err) {
			util.log(err);
			return;
		}

		util.logat('%-gray', '  - loaded file: {1}', path);

		if (util.isEmpty(protobuf[fname])) {
			protobuf[fname] = root;
			util.logat('%-gray', '    define as {1}', fname);
		} else {
			util.logat('%-yellow', '  - define as {1}, but it has already existed', fname);
		}
		loadNext(idx + 1, callback);
	});
};

protobuf.init = function(callback) {
	util.log('%-cyan', '  protobuf loaded start.');
	loadNext(0, function() {
		util.log('%-cyan', '  protobuf loaded complete.\n');
		util.isDefine(callback) && callback();
	});
};

module.exports = protobuf;
