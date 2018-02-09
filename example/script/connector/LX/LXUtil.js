var Util = {
    getPageUrl: function () {
        // return 'http://h5.lexun.com/games/snake/index.html?userencrypstring=LkmduezgQc5bwjVFzpS0valI09bsIzAyHU8FtNLpWx%2fgVHOImz3N4KK99UiDSCpKzydmqt%2bxKNw5gjtLZe70wtCVfmSG%2fLFwNpi%2bvs9%2bKaRbl5fWwvyljE52Z%2fLTXdx4XnOkoP0eJPMRDePFvL4mJ6VUfgTiAumJ84g9WfVxcXoKNd8aWUUvss3RMZgNkLIvF3l0RHRGThUypWztgvtji8xed%2bKQGjsZKgB8SOY0X%2fUyd271dVvoyQN3d7rfc9YqxgXrnfFWKxLvWlRT5jj5TSDXevpfw%2bzBYU5o16I8T9OOhv%2fGAnksl%2bDoIL2ChvI3Je14THmu5y7wluUj7bupBctZO%2faDlhn43NVk4yTBBnoClYIO99D2K36hEl8gUe5jVktcQHLuA0AKTVtoLhd2waErGH%2bFVOPZroVP1le2KJK3bcvMOUtxOZb2fO%2fxe0pfUxwgODjvgZIf5ROc2pjwdZcXc%2bnqixH2t2yBXwTyN%2bGATcIVeY0%2ffLmtke4gtepycQR0T0h2aP95jC0tTDKBzA%3d%3d&userencryptkey=HDy5zmn0sT4huAh%2fPUyTE%2fnb8ErVFRwMPEMs3EFyHDv84bGUIOmm87vsHXBsEWzAdYXBZz%2b1EXsY1QQuZ6g%2bY49P72jqRbCvz%2f%2bxmikr%2fZXGo2oFmwS89dwqFMHp%2be2P6qeMM%2b4FaAlwWLD7UWU9GxFcguSzoXIPlq%2bxyCb2OqM%3d';
        return 'http://h5.lexun.com/games/snake/index.html?userencrypstring=yl%2fs7IFYd4Ce7PoK6Dm5cjO70yGtvhXh7eCdk1gGV4xnd11pkxhdLx%2fwVjekizOEP%2bYklVCWTpXTFMkGz%2feQNPyI5EFw7SZCgWWehY7FQDzXm5FbSAoE18q7vz4sQYYMguSsEET4TGEJhS0H%2bQSt0axKL07KUOqngNI%2buidZ8YTL4MA4nI1AiQtWmfljwmXtrdhTBkM4ykQANwtMJlOnXiHFElUv3WGq97oDxUHVuZ%2fpR9TbUlws7Q4sX2wCyOn5PwQGw4ZEgDdklvGaJ5Am0%2fGHy71fB%2fLs46iyGa%2fHWMyCbliAZW4MxtdyFk2h4H91ti5Sfx6rlMfnL5iMtiGjp7h3E2I3ANo8KHgKXwiRlc3wI1TkoIYMZPS%2f8%2fMVR3zqG0Orzn6TS0xtvkX7N5bNAxO6YCZI6zDnNddUgE23SO1XRtgE2SaATd3UjhUJxy%2fcbad%2biw9T564W5HQywWw0TlGBXkNGgsGB%2bqCw7jCk%2bZuz0rPINQOvMLWOE9bGAUOu%2bkj%2bApXEUdSLtaEpWce5Dg%3d%3d&userencryptkey=Qqq4%2b9M%2bf3BrEoM54%2b%2bw4tXiVvxWYX8OUMMhIrK%2bR%2fAW8hu%2fuJd2O8vbo3HRp%2bFdk5WizCfa5iuKDL%2bA%2fop12nuxO94J40wfqcfrZs%2bqsG8MKpXU3aVxPdcTgMMaNOcskgfVy5WU0ZZmkxjgXqFI5LZlzMTUjXwGZiV78cvKDu4%3d';
        try {
            return global.location.href;
        } catch (error) {
            return '';
        }
    },

    getSearchStr: function (url) {
        var result = '';
        var regex = /\?([^#]*)/;
        if (regex.test(url)) {
            result = regex.exec(url)[0];
        }
        return result;
    },

    getHashStr: function (url) {
        var result = '';
        var regex = /#([\w\W]*)/;
        if (regex.test(url)) {
            result = regex.exec(url)[0];
        }
        return result;
    },

    getSearchParamValue: function (url, paramName) {
        var result = '';
        var searchStr = this.getSearchStr(url);
        var regex = new RegExp('(' + paramName + ')=([^&]*)');
        if (regex.test(searchStr)) {
            result = decodeURIComponent(regex.exec(searchStr)[2]);
        }
        return result;
    },

    replaceSearchParamValue: function (url, paramName, paramValue) {
        var result = url;
        var searchStr = this.getSearchStr(url);
        var regex = new RegExp('(' + paramName + ')=([^&]*)');
        if (regex.test(url)) {
            result = url.replace(regex, '$1=' + encodeURIComponent(paramValue));
        } else {
            var hashStr = this.getHashStr(url);
            if (hashStr == '') {
                if (searchStr == '') {
                    result = url + '?' + paramName + '=' + encodeURIComponent(paramValue);
                } else {
                    result = url + '&' + paramName + '=' + encodeURIComponent(paramValue);
                }
            } else {
                if (searchStr == '') {
                    result = url.replace(hashStr, '?' + paramName + '=' + encodeURIComponent(paramValue) + hashStr);
                } else {
                    result = url.replace(hashStr, '&' + paramName + '=' + encodeURIComponent(paramValue) + hashStr);
                }
            }
        }
        return result;
    },

    SERVER_IP: 'h5s.lexun.com',
    // SERVER_IP: '121.46.13.145',
    // SERVER_IP: '120.204.196.224',

    // SERVER_IP: '123.206.128.101',
    // SERVER_IP: '119.23.109.138',

    int2ip: function (num) {
        return this.SERVER_IP;
        // var tt = new Array(4);
        // tt[0] = (num >>> 24) >>> 0;
        // tt[1] = ((num << 8) >>> 24) >>> 0;
        // tt[2] = (num << 16) >>> 24;
        // tt[3] = (num << 24) >>> 24;
        // var str = String(tt[0]) + '.' + String(tt[1]) + '.' + String(tt[2]) + '.' + String(tt[3]);
        // return str;
    },
};

module.exports = Util;