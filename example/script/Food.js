var Food = cc.Class({
    extends: cc.Component,

    properties: {
        skins: [cc.SpriteFrame],
    },

    statics: {
        MIN_RADIUS: 0,
        MAX_RADIUS: 0,
        SCORE_RADIUS_RATIO: 0,
        RANDOM_SKINS: [],
        RANDOM_RATES: [],
        setConfig: function (config) {
            cc.js.mixin(Food, config);
        },
    },

    ctor: function () {
        this.id = 0;
        this.score = 0;
        this.posX = 0;
        this.posY = 0;
        this.degree = 0;
    },

    parseData: function (data) {
        cc.js.mixin(this, data);
        this.refresh();
    },

    refresh: function () {
        var node = this.node;
        node.position = cc.p(this.posX, this.posY);
        node.rotation = this.degree;
        node.setLocalZOrder(this.skin * -100);
        var score = this.score;
        var radius = Food.MIN_RADIUS + (score / Food.SCORE_RADIUS_RATIO);
        if (radius > Food.MAX_RADIUS)
            radius = Food.MAX_RADIUS;
        node.setContentSize(radius * 2, radius * 2);
        var spriteFrame = this.skins[this.skin - 1];
        if (!spriteFrame)
            spriteFrame = this.skins[0];
        node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    },

    disappearTo: function (pos) {
        var node = this.node;
        var delay = 0;
        if (node.isRunning()) {
            delay = 0.20;
            node.runAction(cc.moveTo(delay, pos));
        }
        node.emit('disappear', {delay: delay});
    },
});
