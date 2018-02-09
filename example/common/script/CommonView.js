cc.Class({
    extends: cc.Component,

    properties: {
        alertPrefab: cc.Prefab,
        tipsPrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.node.setLocalZOrder(99999);
    },

    reset: function () {
        // this.hideTips();
    },

    showAlert: function (key, title, content, confirmText, onConfirm) {
        if (!key)
            return;
        var alerts = this.alerts;
        if (!alerts)
            alerts = this.alerts = {};
        if (alerts[key])
            return;
        var alert = cc.instantiate(this.alertPrefab);
        alert.active = true;
        alert.setLocalZOrder(100);
        var box = alert.getChildByName('box');
        box.getChildByName('title').getComponent(cc.Label).string = title;
        box.getChildByName('content').getComponent(cc.Label).string = content;
        var btnConfirm = box.getChildByName('btnConfirm');
        btnConfirm.getChildByName('label').getComponent(cc.Label).string = typeof confirmText == 'string' ? confirmText : '确认';
        btnConfirm.targetOff(this);
        btnConfirm.on(cc.Node.EventType.TOUCH_START, function (evt) {
            evt.stopPropagation();
            this.hideAlert(key);
            onConfirm && onConfirm();
        }, this);
        this.node.addChild(alert);
        alerts[key] = alert;
        return alert;
    },

    hideAlert: function (key) {
        var alerts = this.alerts;
        for (var p in alerts) {
            if (!alerts.hasOwnProperty(p))
                continue;
            if (!key || key == p) {
                var alert = alerts[p];
                if (!alert)
                    continue;
                alert.destroy();
                alerts[p] = null;
            }
        }
    },

    showTips: function (key, content, timeout) {
        if (!key)
            return;
        var tips = this.tips;
        if (!tips)
            tips = this.tips = {};
        if (tips[key])
            return;
        var tip = cc.instantiate(this.tipsPrefab);
        tip.active = true;
        tip.setLocalZOrder(100);
        tip.getChildByName('content').getComponent(cc.Label).string = content;
        this.node.addChild(tip);
        tips[key] = tip;
        if (timeout > 0) {
            tip.runAction (cc.sequence(cc.delayTime(timeout / 1000), cc.callFunc(function () {
                if (!cc.isValid(tip))
                    return;
                this.hideTips(key);
            }.bind(this))));
        }
        return tip;
    },

    hideTips: function (key) {
        var tips = this.tips;
        for (var p in tips) {
            if (!tips.hasOwnProperty(p))
                continue;
            if (!key || key == p) {
                var tip = tips[p];
                if (!tip)
                    continue;
                tip.destroy();
                tips[p] = null;
            }
        }
    },
});
