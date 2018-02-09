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
        var handle = function (callback, target) {
            return function (evt) {
                //cc.log('handle', evt.type, evt.detail);
                callback && callback.call(target, evt.detail);
            };
        };
        conn.on('depositInfo', handle(this.onDepositInfo, this), this);
        conn.on('depositSaveResult', handle(this.onDepositSaveResult, this), this);
        conn.on('depositDrawResult', handle(this.onDepositDrawResult, this), this);

        this.hide();
    },

    show: function () {
        this.node.active = true;
        var children = this.node.children;
        for (var i = 0, len = children.length; i < len; i++) {
            children[i].active = false;
        }
    },

    showDrawView: function () {
        this.show();
        this.node.getChildByName('pl_draw').active = true;
    },

    assertHasSaveChance: function (callback) {
        var fn = function () {
            this.assertDrawable(callback);
        }.bind(this);
        if (this.GetDepositSaveChance() > 0) {
            fn && fn();
            return;
        }
        var time = Util.getLocalStorage('depositTipsIgnoreTime');
        if (time && (new Date() - new Date(time)) / (60 * 60 * 1000) < 3) {
            fn && fn();
            return;
        }
        this.onTipsSkip = function () {
            var isTipsIgnored = this.node.getChildByName('pl_tips').getComponentInChildren(cc.Toggle).isChecked;
            if (isTipsIgnored)
                Util.setLocalStorage('depositTipsIgnoreTime', new Date());
            callback && callback();
            return;
        };
        this.showTips();
    },

    showTips: function () {
        this.show();
        this.node.getChildByName('pl_tips').active = true;
    },

    assertDrawable: function (callback) {
        this.commonView.showTips('assertDrawable', '请稍候', 3000);
        this.conn.send('depositDrawCheck');
        this.conn.once('depositDrawCheckResult', function (evt) {
            var data = evt.detail;
            this.commonView.hideTips('assertDrawable');
            if (data.isSucc) {
                callback && callback();
                return;
            }
            var time = Util.getLocalStorage('depositTipsIgnoreTime2');
            if (time && (new Date() - new Date(time)) / (60 * 60 * 1000) < 3) {
                callback && callback();
                return;
            }
            this.onTipsSkip = function () {
                var isTipsIgnored = this.node.getChildByName('pl_tips_2').getComponentInChildren(cc.Toggle).isChecked;
                if (isTipsIgnored)
                    Util.setLocalStorage('depositTipsIgnoreTime2', new Date());
                callback && callback();
                return;
            };
            this.showTips2();
        }, this);
    },

    showTips2: function () {
        this.show();
        this.node.getChildByName('pl_tips_2').active = true;
    },

    hide: function () {
        this.node.active = false;
    },

    onBtnClick: function (evt, type) {
        switch (type) {
            case 'close':
                this.hide();
                break;
            case 'draw':
                this.depositDraw();
                break;
            case 'tips_task':
                this.hide();
                this.gameScene.taskView.show();
                break;
            case 'tips_skip':
                this.hide();
                this.onTipsSkip();
                break;
            case 'save_discard':
                this.depositSave(3);
                break;
            case 'save_draw':
                this.depositSave(1);
                break;
            case 'save_exchange':
                this.depositSave(2);
                break;
            case 'save_close':
                this.hideSaveView();
                break;
        }
    },

    onDepositInfo: function (data) {
        var depositInfo = this.depositInfo = data;

        var pl = this.node.getChildByName('pl_draw');
        pl.getChildByName('fd_stone').getChildByName('lb_value').getComponent(cc.Label).string = Util.stringifyCoin(depositInfo.stone);
        pl.getChildByName('fd_draw_limit').getChildByName('lb_value').getComponent(cc.Label).string = Util.stringifyCoin(depositInfo.drawLimit);
        pl.getChildByName('fd_save_chance').getChildByName('lb_value').getComponent(cc.Label).string = depositInfo.saveChance;

        var btn_draw = pl.getChildByName('btn_draw').getComponent(cc.Button);
        btn_draw.interactable = !!(depositInfo.stone > 0 && depositInfo.drawLimit > 0);

        this.gameScene.indexView.updateBtns();
    },

    showSaveView: function (order, callback) {
        this.show();
        this.node.getChildByName('pl_save').active = true;
        this.saveOrder = order;
        this.saveCallback = callback;
        var pl = this.node.getChildByName('pl_save');
        pl.getChildByName('fd_stone').getChildByName('lb_value').getComponent(cc.Label).string = Util.stringifyCoin(order.stone);
        pl.getChildByName('fd_save_chance').getChildByName('lb_value').getComponent(cc.Label).string = this.depositInfo.saveChance;
        if (this.GetDepositSaveChance() <= 0) {
            this.hideSaveView();
        }
    },

    hideSaveView: function () {
        this.hide();
        var order = this.saveOrder;
        if (order) {
            order.status = -2;
        }
        this.saveCallback && this.saveCallback({depositSaveOrder: order});
    },

    depositSave: function (type) {
        this.commonView.showTips('depositSave', '请稍候', 3000);
        this.conn.send('depositSave', {orderID: this.saveOrder.id, type: type});
        this.saveType = type;
    },

    onDepositSaveResult: function (data) {
        this.commonView.hideTips('depositSave');
        if (data.isSucc) {
            this.hide();
            this.saveCallback && this.saveCallback(data);
        } else {
            this.commonView.showAlert('onDepositDrawResult', '提示', (data.msg || ''), '确认');
        }
    },

    depositDraw: function () {
        this.commonView.showTips('depositDraw', '请稍候', 3000);
        this.conn.send('depositDraw'); 
    },

    onDepositDrawResult: function (data) {
        this.commonView.hideTips('depositDraw');
        if (data.isSucc) {
            if (data.userStone > 0) {
                var gameScene = this.gameScene;
                var userInfo = gameScene.userInfo;
                userInfo.stone = data.userStone;
                gameScene.onUserInfo(userInfo);
            }
        } else {
            this.commonView.showAlert('onDepositDrawResult', '提示', (data.msg || ''), '确认');
        }
    },

    GetDepositSaveChance: function () {
        var depositInfo = this.depositInfo;
        if (depositInfo && depositInfo.saveChance > 0)
            return depositInfo.saveChance;
        return 0;
    },
});
