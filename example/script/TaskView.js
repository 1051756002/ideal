var Util = require('Util');

cc.Class({
    extends: cc.Component,

    properties: {
        taskItemPrefab: cc.Prefab,
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
        conn.on('taskList', handle(this.onTaskList, this), this);
        conn.on('taskDrawResult', handle(this.onTaskDrawResult, this), this);
        conn.on('shareGameResult', handle(this.onShareGameResult, this), this);

        this.hide();
    },

    show: function () {
        this.node.active = true;
        this.taskList();
    },

    hide: function () {
        this.node.active = false;
    },

    onBtnClick: function (evt, type) {
        switch (type) {
            case 'close':
                this.hide();
                break;
        }
    },

    onShareGameResult: function (data) {
        if (!data.isSucc) {
            this.commonView.showAlert('onShareGameResult', '提示', data.msg, '确认');
        } else {
            Util.postFrameWorkMsg('share');
        }
    },

    taskList: function () {
        this.conn.send('taskList');
    },

    onTaskList: function (data) {
        var tasks = this.tasks = data.tasks || [];
        this.showTaskList();
    },

    showTaskList: function () {
        var tasks = this.tasks;
        var sv = this.node.getComponentInChildren(cc.ScrollView);
        var content = sv.content;
        content.removeAllChildren();
        var handleOp = function (opType, opParam) {
            return function () {
                switch (opType) {
                    case 1:
                        this.conn.send('shareGame');
                        break;
                    case 2:
                        if (!Util.postFrameWorkMsg('switchGame:' + opParam)) {
                            this.commonView.showAlert('postFrameWorkMsg', '提示', '操作失败', '确认');
                        }
                        break;
                }
                this.hide();
            };
        };
        var handleDraw = function (taskID) {
            return function () {
                this.taskDraw(taskID);
            };
        };
        var doneCount = 0;
        for (var i = 0, len = tasks.length; i < len; i++) {
            var task = tasks[i];
            var item = cc.instantiate(this.taskItemPrefab);
            item.getChildByName('lb_content').getComponent(cc.Label).string = task.content;
            item.getChildByName('lb_progress').getComponent(cc.Label).string = '进度:(' + task.currValue + '/' + task.needValue + ')';
            var btn_op = item.getChildByName('btn_op').getComponent(cc.Button);
            var btn_draw = item.getChildByName('btn_draw').getComponent(cc.Button);
            if (task.status == 0) {
                btn_op.node.active = true;
                btn_draw.node.active = false;
                btn_op.node.on('click', handleOp(task.opType, task.opParam), this);
            } else {
                btn_op.node.active = false;
                btn_draw.node.active = true;
                if (task.status == 1) {
                    btn_draw.node.on('click', handleDraw(task.taskID), this);
                } else {
                    btn_draw.interactable = false;
                    doneCount++;
                }
            }
            content.addChild(item);
        }
        sv.scrollToTop();
        if (doneCount >= tasks.length) {
            Util.setLocalStorage('taskDoneTime', new Date());
        } else {
            Util.removeLocalStorage('taskDoneTime');
        }
        this.gameScene.indexView.updateBtns();
    },

    taskDraw: function (taskID) {
        this.commonView.showTips('taskDraw', '请稍候', 3000);
        this.conn.send('taskDraw', {taskID: taskID});
    },

    onTaskDrawResult: function (data) {
        this.commonView.hideTips('taskDraw');
        if (!!data.msg) {
            this.commonView.showAlert('onTaskDrawResult', '提示', data.msg, '确认');
        }
        var tasks = this.tasks || [];
        var task = data.task;
        if (task) {
            for (var i = 0, len = tasks.length; i < len; i++) {
                var task_temp = tasks[i];
                if (task.taskID == task_temp.taskID) {
                    cc.js.mixin(task_temp, task);
                    break;
                }
            }
        }
        this.showTaskList();
    },

    IsAllTaskDone: function () {
        var time = Util.getLocalStorage('taskDoneTime');
        if (time && new Date().getDay() == new Date(time).getDay())
            return true;
        return false;
    },
});
