let http = require('http');
let util = require('./util/index');
let config = require('./core/config');

const url  = require('url');
const util2 = require('util');
const querystring = require('querystring');

global.util = util;
global.config = config;

config.server.forEach(function(server) {
	server.address = util.getIp();
});

let server = http.createServer(function(req, res) {
	let post = '';
	req.on('data', function(chunk) {
		post += chunk;
	});

	req.on('end', function() {
		post = JSON.parse(post);

		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': '*',
		});
		util.log(post);

		res.write(JSON.stringify({
			code: 0,
			token: 'ASDUIA789CH_+AIZ76544Q',
		}));

		res.end();
	});
});

util.clear();
util.log('%-green', '  ServerUrl: ws://%s:%d', config.server[0].address, config.server[0].port);

server.allowHalfOpen = false;
server.listen({
	port: config.server[0].port,
	host: config.server[0].address
}, function() {
	util.log('%-green', '  Server is starting ...\n');
});
