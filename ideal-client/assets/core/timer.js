let timer = {
	time: 0,
};
let stid_loop = 0;

timer.init = function(time) {
	this.stop();
	this.time = time;
	stid_loop = setTimeout(loop, 16);
};

timer.stop = function() {
	this.time = 0;
	clearTimeout(stid_loop);
};

let loop = function() {
	timer.time += 16;

	stid_loop = setTimeout(loop, 16);
};

export default timer;
