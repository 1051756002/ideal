require('../ideal-server/core/ideal');

var images = require('images');
var fs = require('fs');
var path = require('path');

function readFile(src) {
	if (fs.existsSync(src)) {
		// 读取文件夹
		fs.readdir(src, function(err, files) {
			if (err) throw err;

			files.forEach(function(filePath) {
				var url = path.join(src, filePath);

				fs.stat(url, function(err, stats) {
					if (err) throw err;

					// 文件
					if (stats.isFile()) {
						if (/.*\.(jpg|png)$/i.test(url)) {
							encoderImage(url);
						}
					}
					// 文件夹
					else if (stats.isDirectory()) {
						readFile(url);
					}
				});
			});
		});
	} else {
		throw 'no files, no such!';
	}
}

function encoderImage(imgpath) {
	var match = imgpath.match(/(.*\/)(.*)\.(jpg|png)$/i);

	if (match == null) {
		util.logat('%-yellow', 'error file: {1}', imgpath);
		return;
	}

	var prefix = match[1];
	var filename = match[2];
	var jsonpath = util.format('{1}{2}.json', prefix, filename);
	if (fs.existsSync(jsonpath)) {
		// 读取配置文件
		fs.readFile(jsonpath, 'utf-8', function(err, data) {
			if (err) throw err;
			doJson(JSON.parse(data), prefix, filename);
		});
	}
}

function mkdirs(dirpath, mode, callback) {
	fs.exists(dirpath, function(exists) {
		if (exists) {
			callback(dirpath);
		} else {
			// 尝试创建父目录, 然后再创建当前目录
			mkdirs(path.dirname(dirpath), mode, function() {
				fs.mkdir(dirpath, mode, callback);
			});
		}
	})
}

function doJson(data, prefix, filename) {
	// Egret图集格式
	if (util.isDefine(data.file) && util.isDefine(data.frames)) {
		util.logat('%-green', '  do {1}:', data.file);

		for (var i in data.frames) {
			(function(i) {

			var _match = i.match(/(.*)_(jpg|png)$/i);
			var _file = _match[1] + '.' + _match[2];

			// 保存到输出目录
			var outpath = './out/' + filename;
			var outpath2 = outpath + '/' + _file;

			mkdirs(outpath, 0777, function() {
				var conf = data.frames[i];
				var atlas = images(prefix + data.file);
				var chunk = images(conf.sourceW, conf.sourceH);

				images(atlas, conf.x, conf.y, conf.w, conf.h).save(outpath2);
				util.logat('%-green', '  - out ' + outpath2);
			});

			})(i);
		}
	} else {
		util.logat('%-gray', '  json format error. file: {1}', filename);
	}
}

util.clear();

var args = process.argv.splice(2);
if (args.length > 0) {
	readFile(args[0]);
} else {
	readFile('./res');
}
