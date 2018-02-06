let util = {};

util.toTime = function(time) {
	var dt = Date.now() - time;
    if (dt >= 24 * 60 * 60 * 1000)
        return Math.floor(dt / (24 * 60 * 60 * 1000)) + '天前';
    else if (dt >= 60 * 60 * 1000)
        return Math.floor(dt / (60 * 60 * 1000)) + '小时前';
    else if (dt >= 60 * 1000)
        return Math.floor(dt / (60 * 1000)) + '分钟前';
    else if (dt >= 0)
        return '刚才';
    else
        return '';
};

util.toTime2 = function(use_time, sys_time) {
	use_time = parseInt(use_time);
	if (typeof sys_time == 'undefined') {
		sys_time = Date.now();
	} else {
		sys_time = parseInt(sys_time);
	}

	let date_time = 24 * 60 * 60 * 1000;
	let diff_time = sys_time - use_time;
	let use_day = new Date(use_time).getDate();
	let sys_day = new Date(sys_time).getDate();

	// 显示日期
	if (diff_time > date_time || use_day != sys_day) {
		return this.fmtDate(use_time);
	}
	// 显示时间
	else {
		return this.fmtDate2(use_time);
	}
};

util.fmtDate = function(obj) {
	let date = new Date(obj);
	let y = 1900 + date.getYear();
	let M = this.zeroize(date.getMonth() + 1);
	let d = this.zeroize(date.getDate());
	let h = this.zeroize(date.getHours());
	let m = this.zeroize(date.getMinutes());
	return this.format('{2}-{3} {4}:{5}', y, M, d, h, m);
};

util.fmtDate2 = function(obj) {
	let date = new Date(obj);
	let h = this.zeroize(date.getHours());
	let m = this.zeroize(date.getMinutes());
	return this.format('{1}:{2}', h, m);
};

// 生成随机数
util.rnd = function(min, max) {
	if (typeof max == 'undefined') {
		max = min;
		min = 0;
	}

	return Math.floor(Math.random() * max + min);
};

// 占位符字符串
util.format = function() {
	var str = arguments[0];

	for (var i = 0; i < arguments.length; i++) {
		str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
	}
	return str;
};

// 去空格
util.trim = function(text) {
	if (typeof(text) == 'string') {
		return text.replace(/^\s*|\s*$/g, '');
	} else {
		return text;
	}
};

// 深拷贝
util.clone = function(obj) {
	var str, newobj = obj.constructor === Array ? [] : {};
	if (typeof obj !== 'object') {
		return;
	} else if (window.JSON) {
		str = JSON.stringify(obj), newobj = JSON.parse(str);
	} else {
		for (var i in obj) {
			newobj[i] = typeof obj[i] === 'object' ? this.clone(obj[i]) : obj[i];
		}
	}
	return newobj;
};

// 补零
util.zeroize = function(val, num) {
	if (typeof num == 'undefined') {
		num = 2;
	}
	let str = '';
	for (let i = 0; i < num; i++) {
		str += '0';
	}
	str += val;
	return str.substring(str.length - num);
};

// 控制平台打印日志
util.log = function() {
	if (!config.debug) {
		return;
	}
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	console.log.apply(console, args);
};

// 控制平台打印警告
util.warn = function() {
	if (!config.debug) {
		return;
	}
	let args = [];
	for (let i = 0; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	console.warn.apply(console, args);
};

util.getPageRawUrl = function () {
    try {
        return 'http://' + location.host + location.pathname;
    } catch (error) {
        return '';
    }
};

/**
 * 获得地址参数列表
 * @param name
 * @returns {null}
 */
util.getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r, idx = location.search.indexOf('/');
    if (idx == -1) {
    	r = location.search.substr(1).match(reg);
    } else {
    	r = location.search.substring(1, idx).match(reg);
    }
    if (r != null)
        return unescape(r[2]);
    return null;
};

/**
 * 添加地址参数
 * @param url
 * @param name
 * @param value
 * @returns {*}
 */
util.addUrlPara = function (url, name, value) {
    if (/\?/g.test(url)) {
        if (/name=[-\w]{4,25}/g.test(url)) {
            url = url.replace(/name=[-\w]{4,25}/g, name + "=" + encodeURIComponent(value));
        } else {
            url += "&" + name + "=" + encodeURIComponent(value);
        }
    } else {
        url += "?" + name + "=" + encodeURIComponent(value);
    }
    return url;
};

/**
 * 获得cookie
 * @param key
 * @returns {null}
 */
util.getCookie = function (key) {
    var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
};

/**
 * 获取lxt串号
 */
util.getLxt = function() {
    var result = this.getQueryString('lxt');
    if (!result) {
		if (config.Debug) {
			return 'f7d9f4720444f76csxrxqcgfsq';
		}
        var cookie = this.getCookie('lexun.com');
        var regex = new RegExp('(lxt)=([^&]*)');
        if (regex.test(cookie)) {
            result = decodeURIComponent(regex.exec(cookie)[2]);
        }
    }
    return result;
};

module.exports = util;