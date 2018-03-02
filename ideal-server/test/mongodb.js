require('./base');

let mongo = require('mongodb').MongoClient;
let url = 'mongodb://localhost:27017';

mongo.connect(url, function(err, db) {
	if (err) {
		util.log('%-red', 'Error: ' + err);
		return;
	}

	util.log('connect success!');

	let dbo = db.db('ideal');

	false && dbo.createCollection('site2', function(err, result) {
		if (err) {
			util.log('%-red', 'Error: ' + err);
			return;
		}

		util.log('创建集合');

		db.close();
	});

	let obj = {
		username: 'jiawei3t',
		password: '19940106',
	};
	false && dbo.collection('site2').insertOne(obj, function(err, result) {
		if (err) {
			util.log('%-red', 'Error: ' + err);
			return;
		}

		util.log('文档插入成功');

		db.close();
	});

	dbo.collection('ideal').find().toArray(function(err, result) {
		if (err) {
			util.log('%-red', 'Error: ' + err);
			return;
		}

		util.log(result);

		db.close();
	});
});
