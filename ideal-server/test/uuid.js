require('./base');

let arr = [];
let repeat = 0;
let len = 100;

function f1() {

	for (let i = 0; i < len; i++) {
		let uuid = require('node-uuid').v4();

		while (arr.indexOf(uuid) > -1) {
			repeat++;
			uuid = require('node-uuid').v4();
		}
		util.log(uuid);
		arr.push(uuid);
	};

	util.logat('循环{1}次, 重复{2}, 数组长度{3}', len, repeat, arr.length);

}

for (let i = 0; i < 10; i++) {
	f1();
}
