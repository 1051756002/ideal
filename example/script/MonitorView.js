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
        this.info = info;
        this.getComponentInChildren(cc.Label).string = info;
        this.node.active = !!info;
    },

    appendInfo: function (info) {
        this.showInfo(this.info + (info || ''));
    },

    clearInfo: function () {
        this.showInfo('');
    },
});
