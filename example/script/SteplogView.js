cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        this.clearInfo();
    },

    showInfo: function (info) {
        info = info || '';

        var maxLen = 5;
        var logs = this.logs;
        
        if (info.toString().length > 0) {
            logs.unshift(info.toString());
        }

        if (logs.length > maxLen) {
            logs.splice(maxLen);
        }

        if (logs.length > 0) {
            this.node.active = true;
            this.getComponentInChildren(cc.Label).string = logs.join('\r\n');
        } else {
            this.node.active = false;
        }
    },

    clearInfo: function () {
        this.logs = [];
        this.showInfo('');
    },
});
