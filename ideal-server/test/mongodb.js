require('./base');

let db, mongo = require('mongodb').MongoClient;
let url = 'mongodb://localhost:27017';

// 查询
let get = function(table, where = {}, callback) {
	if (util.isEmpty(db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	db.collection(table).find(where).toArray(function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} find Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				list: ret,
			};
		}

		util.isDefine(callback) && callback(result);
	});
};

// 添加
let add = function(table, data = {}, callback) {
	if (util.isEmpty(db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	db.collection(table).insert(data, function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} insert Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				n: ret.result.n,
			};
			util.logat('%-gray', '  add count {1}', result.result.n);
		}

		util.isDefine(callback) && callback(result);
	});
};

// 删除
let del = function(table, where = {}, callback) {
	if (util.isEmpty(db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	db.collection(table).deleteMany(where, function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} delete Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				n: ret.result.n,
			};
			util.logat('%-gray', '  del count {1}', ret.result.n);
		}

		util.isDefine(callback) && callback(result);
	});
};

// 修改
let mod = function(table, data = {}, where = {}, callback) {
	if (util.isEmpty(db)) {
		util.log('%-red', '  db is undefined.');
		util.isDefine(callback) && callback({ code: 501 });
		return;
	}

	db.collection(table).updateMany(data, where, function(err, ret) {
		let result = { code: 0 };
		if (util.isDefine(err)) {
			result = {
				code: 500,
				errmsg: err,
			};
			util.logat('%-red', '  Collection {1} delete Error: {2}', table, err);
		} else {
			result = {
				code: 0,
				n: ret.result.nModified,
			};
			util.logat('%-gray', '  mod count {1}', ret.result.nModified);
		}

		util.isDefine(callback) && callback(result);
	});
};

let init = function(callback) {
	mongo.connect(url, function(err, client) {
		if (util.isDefine(err)) {
			util.log('%-red', '  DB Connection Error: ' + err);
			return;
		}

		util.log('%-green', '  Connection success.');

		db = client.db('ideal');

		util.isDefine(callback) && callback();
	});
};

init(function() {
	get('t_user', { userid: { $gte: 10000 } }, function(result) {
		util.log(result);
	});

	false && add('t_user', [
		{
			userid: 10002,
			nick: '秀姑娘',
			username: 'gwx157',
			password: 'gwx199416520',
			gender: 0,
			phone: 18518100812,
		}
	]);

	false && del('t_user', { userid: 10001 });

	false && mod('t_user', { userid: 10001 }, { $set: { nick: '秀小猪' } });
});
