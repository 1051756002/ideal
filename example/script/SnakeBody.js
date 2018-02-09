cc.Class({
    extends: cc.Component,

    properties: {
        spriteFrames: [cc.SpriteFrame],
    },

    init: function (skin, idx) {
        var node = this.node;
        this.getComponent(cc.Sprite).spriteFrame =  this.spriteFrames[skin - 1] || this.spriteFrames[0];
        var eyes = this.eyes;
        if (!eyes)
            eyes = this.eyes = node.getChildByName('eyes');
        if (idx == 1)
            !eyes.parent && node.addChild(eyes);
        else
            eyes.removeFromParent();
        node.setLocalZOrder(-idx);
    },

    setRadius: function (radius) {
        this.node.setContentSize(radius * 2, radius * 2);
    },
    
    moveTo: function (pos, degree) {
        var node = this.node;
        node.position = pos;
        node.rotation = degree;
    },
});
