cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        var node = this.node;

        this.stick = this.node.getChildByName('stick');
        this.stickHead = this.stick.getChildByName('head')
        this.stickOrigin = this.stick.position;

        node.on(cc.Node.EventType.TOUCH_START, function (evt) {
            if (!cc.pSameAs(this.stick.position, this.stickOrigin))
                return;
            var pos = evt.getLocation();
            pos = this.node.convertToNodeSpaceAR(pos);
            this.setStickPos(pos);
        }, this);
        node.on(cc.Node.EventType.TOUCH_MOVE, function (evt) {
            var pos = evt.getLocation();
            pos = this.stick.convertToNodeSpaceAR(pos);
            this.setStickHeadPos(pos);
        }, this);
        node.on(cc.Node.EventType.TOUCH_END, function (evt) {
            this.setStickPos();
        }, this);
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (evt) {
            this.setStickPos();
        }, this);

        this.setStickPos();
    },

    setStickPos: function (pos) {
        if (!pos)
            pos = this.stickOrigin;
        this.stick.position = pos;
        this.setStickHeadPos();
    },

    setStickHeadPos: function (pos) {
        if (!pos)
            pos = cc.p(0, 0);
        var maxLen = this.stick.width / 2;
        var ratio = cc.pLength (pos) / maxLen;
        if (ratio > 1) {
            pos = cc.pMult(pos, 1 / ratio);
            ratio = cc.pLength (pos) / maxLen;
        }
        //角度 = 弧度 * 180 / Math.PI
        //弧度 = 角度 * Math.PI / 180
        var degree = ((cc.pToAngle(pos) * 180 / Math.PI) + 360) % 360;
        this.stickHead.position = pos;
        this.node.emit('change', {vec: pos, degree: degree, ratio: ratio});
    },
});
