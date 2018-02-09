var Util = require('Util');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        
    },

    init: function () {
        var gameScene = this.gameScene = cc.director.getScene().getComponentInChildren(require('GameScene'));
        var commonView = this.commonView = gameScene.commonView;
        var conn = this.conn = gameScene.conn;
    },

    show: function (gameResult) {
        var depositView = this.gameScene.depositView;
        var order = gameResult.depositSaveOrder;
        if (order && order.status == 0) {
            depositView.showSaveView(order, function (data) {
                var order_temp = data.depositSaveOrder;
                if (order_temp && order_temp.id == order.id) {
                    gameResult.depositSaveOrder = order_temp;
                    this.show(gameResult);
                }
            }.bind(this));
            return;
        }
        this.node.active = true;
        var pl = this.node.getChildByName('pl');
        pl.getChildByName('fd_score').getChildByName('lb_value').getComponent(cc.Label).string = gameResult.score;
        pl.getChildByName('fd_kills').getChildByName('lb_value').getComponent(cc.Label).string = gameResult.kills;
        pl.getChildByName('btn_lxstone').active = false;
        var tips = '';
        if (order) {
            if (order.status == 3)
                tips = '本次游戏成功赚取' + Util.stringifyCoin(order.stone) + '金币';
            else if (order.status == 4)
                tips = '本次游戏成功赚取' + Util.stringifyCoin(order.stone) + '乐币';
            else if (order.status == 5)
                tips = '放弃了本局' + Util.stringifyCoin(order.stone) + '金币奖励，但保留了1次赚币机会';
            else
                tips = order.msg || '';
            if (order.status == 4)
                pl.getChildByName('btn_lxstone').active = true;
        }
        pl.getChildByName('lb_tips').getComponent(cc.Label).string = tips;
    },

    hide: function () {
        this.node.active = false;
    },

    onBtnClick: function (evt, type) {
        switch (type) {
            case 'quit':
                this.conn.send('quit');
                break;
            case 'revive':
                this.gameScene.revive();
                break;
            case 'lxstone':
                Util.postFrameWorkMsg('lxstone');
                break;
        }
    },
});
