var CommonView = require('CommonView');
var LXConnector = require('LXConnector');

var ControlView = require('ControlView');
var ResultView = require('ResultView');
var RankView = require('RankView');
var IndexView = require('IndexView');
var DepositView = require('DepositView');
var TaskView = require('TaskView');

var MonitorView = require('MonitorView');
var SteplogView = require('SteplogView');

var GameMap = require('GameMap');
var SnakeManager = require('SnakeManager');
var FoodManager = require('FoodManager');

var Util = require('Util');

// var GameServer =  require('GameServer');

cc.Class({
    extends: cc.Component,

    properties: {
        map: GameMap,
        snakeManager: SnakeManager,
        foodManager: FoodManager,

        controlView: ControlView,
        resultView: ResultView,
        rankView: RankView,
        indexView: IndexView,
        depositView: DepositView,
        taskView: TaskView,

        commonView: CommonView,
        monitorView: MonitorView,
        steplogView: SteplogView,
    },

    // use this for initialization
    onLoad: function () {
        // cc._initDebugSetting(cc.DebugMode.INFO);

        if (cc.renderer == cc.rendererCanvas) {
            cc.renderer.enableDirtyRegion(false);
            // cc.renderer._debugDirtyRegion = true;
        }

        this.initConn();
        this.initView();
        this.bindEvents();
        this.reset();

        window.kk = this;
    },

    initConn: function () {
        var connectorNode = new cc.Node();
        connectorNode.addComponent(LXConnector);
        cc.game.addPersistRootNode(connectorNode);
        var conn = this.conn = connectorNode.getComponent(LXConnector);
        var handle = function (callback, target) {
            return function (evt) {
                // cc.log('handle', evt.type, evt.detail);
                callback && callback.call(target, evt.detail);
            };
        };
        conn.on('connected', handle(this.onConnected, this), this);
        conn.on('disconnected', handle(this.onDisconnected, this), this);
        conn.on('reconnecting', handle(this.onReconnecting, this), this);
        conn.on('userInfo', handle(this.onUserInfo, this), this);
        conn.on('gameError', handle(this.onGameError, this), this);
        conn.on('gameInit', handle(this.onGameInit, this), this);
        conn.on('gameStep', handle(this.onGameStep, this), this);
        conn.on('gameResult', handle(this.onGameResult, this), this);
        this.commonView.showTips('onLoad', '场景初始化中......');
        conn.init(function () {
            this.commonView.hideTips('onLoad');
            this.connect();
        }.bind(this));
    },

    initView: function () {
        this.indexView.init();
        this.resultView.init();
        this.depositView.init();
        this.taskView.init();
    },

    bindEvents: function () {
        var snakeManager = this.snakeManager;
        snakeManager.node.on('snakeBorn', function (evt) {            
            var data = evt instanceof cc.Event ? evt.detail : evt;
            var userInfo = this.userInfo;
            var snake = data.snake;
            if (snake.id == userInfo.id) {
                this.map.setTracer(snake.node);
                this.resultView.hide();
                this.depositView.hide();
            }
        }, this);
        snakeManager.node.on('snakeDie', function (evt) {
            var data = evt instanceof cc.Event ? evt.detail : evt;
            var userInfo = this.userInfo;
            var snake = data.snake;
            if (snake.id == userInfo.id) {
                this.map.setTracer(null);
            }
        }, this);

        var controlView = this.controlView;
        controlView.node.on('mandate', function () {
            this.conn.send('mandate');
        }, this);
    },

    update: function (dt) {
        try {
            this.updateGameStep();
            var gameResult = this.gameResult;
            if (gameResult && !gameResult.step) {
                this.resultView.show(gameResult);
                this.gameResult = null;
            }
            this.monitorView.showInfo(Math.floor(dt * 1000) + ' --- ' + this.steps.length + ' --- ' + this.stepUseTime);
        } catch (error) {
            var remark = '';
            switch (typeof error) {
                case 'string':
                    remark = error;
                    break;
                case 'object':
                    remark = error.toString() + '-' + JSON.stringify(error);
                    break;
            }
            cc.error(error);
            this.conn.send('log', {remark: remark});
            var errorCount = this.errorCount || 0;
            if (errorCount > 5) {
                this.conn.disconnect({msg: '游戏异常中断'});
                errorCount = 0;
            } else {
                this.conn.interrupt();
                errorCount++;
            }
            this.errorCount = errorCount;
        }
    },

    updateGameStep: function () {
        var currTime = new Date().getTime();
        var lastStepTime = this.lastStepTime || currTime;
        var deltaTime = currTime - lastStepTime;
        var steps = this.steps;
        var step = steps[0];
        if (!step) {
            if (deltaTime > 3000) {
                this.lastStepTime = null;
                this.conn.interrupt();
            }
            return;
        }
        this.lastStepTime = currTime;
        var frameCount = 1;
        if (!step.hasCal) {
            step.hasCal = true;
            if (steps.length == 1) {
                return;
            }
            for (var i = 2, len = steps.length; i < len; i++) {
                var num = steps[i].frames.length;
                if (i <= 2)
                    num /= 2;
                frameCount += num;
                if (frameCount >= 8) {
                    frameCount = 8;
                    break;
                }
            }
        }
        for (var i = 0, len = frameCount; i < len; i++) {
            step = steps[0];
            if (!step)
                break;
            if (!step.hisFrames) {
                this.snakeManager.updatePerStep(step);
                this.foodManager.updatePerStep(step);
            }
            var frames = step.frames || [];
            var frame = frames.shift();
            if (frame) {
                this.updateGameFrame(frame);
                var hisFrames = step.hisFrames;
                if (!hisFrames)
                    hisFrames = step.hisFrames = [];
                hisFrames.push(frame);
                if (i == len - 1)
                    this.sendControl();
            }
            if (frames.length <= 0) {
                steps.shift();
                var gameResult = this.gameResult;
                if (gameResult && gameResult.step == step) {
                    gameResult.step = null;
                }
            }
        }
        this.map.trace();
        var rankTime = this.rankTime || currTime;
        if (rankTime <= currTime) {
            this.rankView.showRanks(this.snakeManager.getRanks());
            this.rankTime = currTime + 1000;
        }
        this.stepUseTime = new Date().getTime() - currTime;
    },
    
    updateGameFrame: function (frame) {
        this.snakeManager.updatePerFrame(frame);
        this.foodManager.updatePerFrame(frame);
    },

    sendControl: function () {
        var control = this.controlView.popControl();
        if (!control)
            return;
        this.conn.send('control', {toDegree: control.toDegree, isSpeedUp: control.isSpeedUp});
    },

    enter: function () {
        this.depositView.assertHasSaveChance(function () {
            this.conn.send('enter');
        }.bind(this));
    },

    revive:function () {
        this.depositView.assertHasSaveChance(function () {
            this.conn.send('revive');
        }.bind(this));
    },
    
    reset: function () {
        this.resetGame();
        this.indexView.show();
    },

    resetGame: function () {
        this.lastStepTime = null;
        this.steps = [];
        this.snake = null;

        this.map.reset();
        this.snakeManager.reset();
        this.foodManager.reset();

        this.rankView.reset();
        this.resultView.hide();
        this.depositView.hide();
        this.indexView.hide();
    },

    connect: function () {
        this.commonView.hideTips();
        this.reset();
        this.scheduleOnce(function () {
            this.commonView.showTips('connect', '正在为您连接服务器......');
            if (!this.conn.connect())
                this.commonView.hideTips('connect');
        });
    },

    onConnected: function (data) {
        this.commonView.hideTips('connect');
        this.commonView.hideTips('reconnect');
    },

    onDisconnected: function (data) {
        this.commonView.hideTips('connect');
        this.commonView.hideTips('reconnect');
        if (!data)
            return;
        var title = '提示';
        var content = '';
        if (data && typeof data.msg == 'string')
            content += data.msg;
        var confirmText = '重新链接';
        var onConfirm = function () {
            this.connect();
        }.bind(this);
        this.commonView.showAlert('onDisconnected', title, content, confirmText, onConfirm);
    },

    onReconnecting: function (data) {
        this.commonView.hideTips('reconnect');
        this.commonView.showTips('reconnect', '正在为您重新连接服务器......(' + data.count + '/' + data.maxCount + ')');
    },

    onUserInfo: function (data) {
        var userInfo = this.userInfo || {};
        if (userInfo.id != data.id || userInfo.mapID != data.mapID) {
            this.reset();
        }
        userInfo = this.userInfo = data;
        this.indexView.updateUserInfo(userInfo);
    },

    onGameError: function (data) {
        if (data.level > 0) {
            this.conn.disconnect({msg: data.msg});
        } else {
            this.commonView.showAlert('onGameError', '提示', (data.msg || ''), '确认');
        }
    },

    onQuitResult: function (data) {
        if (!!data.code) {
            this.commonView.showAlert('onEnterResult', '提示', (data.msg || ''), '确认');
        }
    },

    onGameInit: function (data) {
        var snakeManager = this.snakeManager;
        var foodManager = this.foodManager;
        switch (data.part) {
            case 1: 
                this.resetGame();
                var map = this.map;
                map.setSize(data.mapWidth, data.mapHeight);
                this.frameRate = data.frameRate;
                this.stepTime = data.stepTime;
                snakeManager.setConfig(data.snakeConfig);
                foodManager.setConfig(data.foodConfig);
                foodManager.setFoodRandomSeed(data.foodRandomSeed);
                // cc.game.setFrameRate(this.frameRate);
                break;
            case 2: 
                snakeManager.updateSnakes(data.snakes);
                foodManager.updateFoods(data.foods);
                break;
            case 3:
                break;
        }
    },

    onGameStep: function (data) {
        // console.log(data);

        this.steplogView.showInfo(new Date().getTime() - cc.game._lastTime.getTime());
        this.steps.push(data);
    },

    onGameResult: function (data) {
        var steps = this.steps;
        if (steps.length > 0) {
            data.step = steps[steps.length - 1];
        }
        this.gameResult = data;
    },
});
