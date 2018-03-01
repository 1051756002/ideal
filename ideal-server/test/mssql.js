require('./base');

let sql = require('mssql');

let cfg = {
	user: 'ideal',
	password: 'newlife',
	server: '192.168.1.120',
	database: 'ideal',
};

sql.connect(cfg, function() {
	util.log('%-green', '  database connection success');

	let request = new sql.Request();

	// 查询
	false && request.query('select * from t_user', function(err, result) {
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
				else if (item[k] typeof 'string') {
					item[k] = util.trim(item.[k]);
				}
			}
		});

		list.forEach(function(item) {
			util.logat('{1} {2}', util.trim(item.nick), util.toTime2(item.addtime));
		});

		sql.close();
	});

	// 新增
	let ins_nick = '理想者', ins_gender = 1;
	false && request.query(`insert into t_user (nick, gender) values ('${ins_nick}', ${ins_gender})`, function(err, result) {
		if (err) {
			util.log('%-red', '  Error: ' + err);
			return;
		}

		util.logat('%-gray', '  数据插入成功, {1}行受影响', result.rowsAffected[0]);
		sql.close();
	});

	// 修改
	let upd_nick = '理想者', upd_userid = 10002;
	false && request.query(`update t_user set nick='${upd_nick}' where userid=${upd_userid}`, function(err, result) {
		if (err) {
			util.log('%-red', '  Error: ' + err);
			return;
		}

		util.logat('%-gray', '  数据更新成功, {1}行受影响', result.rowsAffected[0]);
		sql.close();
	});

	// 删除
	let del_userid = 10008;
	false && request.query(`delete from t_user where userid=${del_userid}`, function(err, result) {
		if (err) {
			util.log('%-red', '  Error: ' + err);
			return;
		}

		util.logat('%-gray', '  数据删除成功, {1}行受影响', result.rowsAffected[0]);
		sql.close();
	});
});
