cc.Class({
    extends: cc.Component,

    properties: {
        map: cc.TiledMap,
        chess: dragonBones.ArmatureDisplay,
    },

    onLoad: function () {
        window.kk = this;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        this.map.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this);

        cc.loader.loadRes('tilemap/tile_iso_offset', cc.TiledMapAsset, function(err, tmxAsset) {
            if (err) {
                util.log(err);
                return;
            }
            // util.log(tmxAsset);
            // this.map.tmxAsset = tmxAsset;
        }.bind(this));
    },

    onDestroy: function() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onTouchBegan: function(ev) {
        util.log(ev.touch.getLocation());
        window.ev = ev;
    },

    onKeyDown: function(event) {
        switch (event.keyCode) {
            case cc.KEY.space:
                util.log('跳跃');
                break;
        }
    },

    onKeyUp: function(event) {
        switch (event.keyCode) {
            case cc.KEY.space:
                // util.log('跳跃');
                break;
        }
    },
});
