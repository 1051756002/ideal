var Rocker = require('Rocker');

cc.Class({
    extends: cc.Component,

    properties: {
        rocker: Rocker,
        speedBtn: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.control = {toDegree: 0, isSpeedUp: false};

        this.rocker.node.on('change', this.onRockerChange, this);
        var speedBtn = this.speedBtn;
        speedBtn.on(cc.Node.EventType.TOUCH_START, this.onSpeedBtnPress, this);
        speedBtn.on(cc.Node.EventType.TOUCH_END, this.onSpeedBtnLoose, this);
        speedBtn.on(cc.Node.EventType.TOUCH_CANCEL, this.onSpeedBtnLoose, this);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDown: function (evt) {
        switch(evt.keyCode) {
            case cc.KEY.space:
                this.onSpeedBtnPress();
                break;
            case cc.KEY.a:
                this.node.emit('mandate');
                break;
        }
    },

    onKeyUp: function (evt) {
        switch(evt.keyCode) {
            case cc.KEY.space:
                this.onSpeedBtnLoose();
                break;
        }
    },

    onRockerChange: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if (data.ratio == 0)
            return;
        var toDegree = data.degree;
        if (typeof toDegree != 'number')
            return;
        var control = this.control;
        // if (control.toDegree == toDegree)
        //     return;
        if (Math.abs(control.toDegree - toDegree) < 5)
            return;
        control.toDegree = parseInt(toDegree);
        control.hasChanged = true;
    },

    onSpeedBtnPress: function (evt) {
        var control = this.control;
        if (control.isSpeedUp)
            return;
        control.isSpeedUp = true;
        control.hasChanged = true;
    },

    onSpeedBtnLoose: function (evt) {
        var control = this.control;
        if (!control.isSpeedUp)
            return;
        control.isSpeedUp = false;
        control.hasChanged = true;
    },

    popControl: function () {
        var control = this.control;
        if (!control.hasChanged)
            return null;
        control.hasChanged = false;
        return control;
    },
});
