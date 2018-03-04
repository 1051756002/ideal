require('./core/ideal');

ideal.init(function() {
	util.log('%-green', '  ideal framework initialization end.');

	ideal.db.get('t_user', { userid: { $gte: 10000 } }, function(result) {
		util.log(result);
	});
});
