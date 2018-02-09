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

    show: function () {
        this.node.active = true;
        this.updateBtns();
    },

    hide: function () {
        this.node.active = false;
    },

    onBtnClick: function (evt, type) {
        switch (type) {
            case 'play':
                this.gameScene.enter();
                break;
            case 'task':
                this.gameScene.taskView.show(); 
                break;
        }
    },

    updateUserInfo: function (userInfo) {
        userInfo = userInfo || {nick: '', stone: 0};
        var header = this.node.getChildByName('header');
        var lb_nick = header.getChildByName('lb_nick').getComponent(cc.Label);
        var lb_stone = header.getChildByName('lb_stone').getComponent(cc.Label);
        lb_nick.string = userInfo.nick;
        lb_stone.string = userInfo.stone;
    },

    updateBtns: function () {
        var gameScene = this.gameScene;
        var node = this.node;
        node.getChildByName('footer').getChildByName('pl_btn').getChildByName('btn_task').getChildByName('red_dot').active = !gameScene.taskView.IsAllTaskDone();
        node.getChildByName('body').getChildByName('btn_mode_infinite').getComponentInChildren(cc.Label).string = gameScene.depositView.GetDepositSaveChance();
    },
});
