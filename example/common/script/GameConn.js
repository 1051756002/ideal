cc.Class({
    extends: cc.Component,

    properties: {
        server: null,
        id: 0,
        nick: '',
    },

    // use this for initialization
    onLoad: function () {

    },

    send: function (type, data) {
        this.server.recv(this, type, data);
    },

    recv: function (type, data) {
        this.emit(type, data);
    },

    emit: function (message, detail) {
        this.node.emit(message, detail);
    },

    on: function (type, callback, target, useCapture) {
        this.node.on(type, callback, target, useCapture);
    },

    off: function (type, callback, target, useCapture) {
        this.node.off(type, callback, target, useCapture);
    },

    targetOff: function (target) {
        this.node.targetOff(target);
    },
});
