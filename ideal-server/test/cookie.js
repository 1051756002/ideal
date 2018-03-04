require('../core/ideal');

let http = require('http');

util.clear();
// 重定向, 获取本地IP地址
config.server.forEach(function(server) {
	server.address = util.getIp();
});


// 短请求服务器
let server = http.createServer(function(req, res) {
	// req.headers.cookie && req.headers.cookie.split(';').forEach(function(Cookie) {
	// 	var parts = Cookie.split('=');
	// 	Cookies[parts[0].trim()] = (parts[1] || '').trim();
	// });

	req.headers.cookie += ';token=test';


	res.writeHead(200, {
		'Set-Cookie': 'token=test;',
		'Access-Control-Allow-Origin': req.headers.origin,
		'Access-Control-Allow-Credentials': true,
		'Content-Type': 'text/plain'
	});

	util.log(req.headers.cookie);

	res.write(JSON.stringify({
		code: 0,
		token: 'test@me'
	}));
	res.end();
});

util.log('%-green', '  ServerUrl: http://%s:%d', config.server[0].address, config.server[0].port);
// 启动服务器
server.allowHalfOpen = false;
server.listen({
	port: config.server[0].port,
	host: config.server[0].address
}, function() {
	util.log('%-green', '  Server is starting ...\n');
});
