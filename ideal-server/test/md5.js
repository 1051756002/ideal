require('./base');

let md5 = require('md5');
let sql = require('mssql');

let cfg = {
	user: 'ideal',
	password: 'newlife',
	server: '192.168.1.120',
	database: 'ideal',
};

let in_nick = '关羽';
sql.connect(cfg, function() {
	util.log('%-green', '  database connection success');

	let request = new sql.Request();

	request.query(`select * from t_user where userid=10001`, function(err, result) {
		if (err) {
			util.log('%-red', '  Error: ' + err);
			return;
		}

		let list = result.recordset;

		// 过滤DateTime类型字段的时区和去空格
		list.forEach(function(item) {
			for (let k in item) {
				if (item[k] instanceof Date) {
					item[k] = item[k].getTime() - 8 * 60 * 60 * 1000;
				}
				else if (typeof item[k] == 'string') {
					item[k] = util.trim(item[k]);
				}
			}
		});

		if (md5(list[0].nick) == md5(in_nick)) {
			util.log('%-green', '  登录成功.');
		} else {
			util.log('%-gray', '  登录失败.');
		}

		sql.close();
	});
});
