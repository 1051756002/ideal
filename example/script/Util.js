var Util = {
    stringifyCoin: function (num, fixed) {
        if (typeof fixed != 'number')
            fixed = 2;
        var str = num;
        if (Math.abs(num) >= 100000000) {
            if (num % 100000000 * Math.pow(10, fixed) <= 0)
                fixed = 0;
            if (fixed == 0)
                str = Math.floor((num / 100000000)) + '亿';
            else
                str = (num / 100000000).toFixed(fixed) + '亿';
        }
        else if (Math.abs(num) >= 10000) {
            if (num % 10000 * Math.pow(10, fixed) <= 0)
                fixed = 0;
            if (fixed == 0)
                str = Math.floor((num / 10000)) + '万';
            else
                str = (num / 10000).toFixed(fixed) + '万';
        }
        return str;
    },

    stringifyTime: function (time) {
        var str = '';
        var hh = Math.floor(time / (60 * 60 * 1000));
        time %= (60 * 60 * 1000);
        var mm = Math.floor(time / (60 * 1000));
        time %= (60 * 1000);
        var ss = Math.floor(time / 1000);
        if (hh > 0)
            str += hh + '小时';
        if (hh > 0 || mm > 0)
            str += mm + '分';
        str += ss + '秒';
        return str;
    },

    stringifyTimeDiff: function (t1, t2) {
        var dt = t2 - t1;
        if (dt >= 24 * 60 * 60 * 1000)
            return Math.floor(dt / (24 * 60 * 60 * 1000)) + '天前';
        else if (dt >= 60 * 60 * 1000)
            return Math.floor(dt / (60 * 60 * 1000)) + '小时前';
        else if (dt >= 60 * 1000)
            return Math.floor(dt / (60 * 1000)) + '分钟前';
        else if (dt >= 1000)
            return Math.floor(dt / (1000)) + '秒前';
        else if (dt >= 0)
            return '刚才';
        else
            return '';
    },

    postFrameWorkMsg: function (msg) {
        if (window == window.parent)
            return false;
        window.parent.postMessage(msg, '*');
        return true;
    },

    setLocalStorage: function (key, value) {
        var storage = window.localStorage;
        if (!storage)
            return false;
        storage.setItem(key, value);
    },

    getLocalStorage: function (key) {
        var storage = window.localStorage;
        if (!storage)
            return null;
        return storage.getItem(key);
    },

    removeLocalStorage: function (key) {
        var storage = window.localStorage;
        if (!storage)
            return null;
        return storage.removeItem(key);
    },
};

var SeedRandom = function (seed) {
    this.seed = seed || new Date().getTime();
};

SeedRandom.prototype.rand = function () {
    var seed = this.seed = (this.seed * 9301 + 49297) % 233280;
    return parseFloat((seed / 233280.0).toFixed(8));
};

SeedRandom.prototype.randInt = function (min, max) {
    return min + Math.floor((max - min) * this.rand());
};

Util.SeedRandom = SeedRandom;

module.exports = Util;
