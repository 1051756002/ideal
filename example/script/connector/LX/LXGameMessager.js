var ProtoBuf = require('protobuf');

var SUB_SNAKE_C_START = 100;
var SUB_SNAKE_S_START = 200;

var MSG_CMD = {
    MDM_CS_GAME_LOGIC: 2000, //游戏主命令
    
    SUB_SNAKE_C_ENTER: SUB_SNAKE_C_START + 1,
    SUB_SNAKE_C_QUIT: SUB_SNAKE_C_START + 2,
    SUB_SNAKE_C_CONTROL: SUB_SNAKE_C_START + 3,
    SUB_SNAKE_C_REVIVE: SUB_SNAKE_C_START + 4,
    SUB_SNAKE_C_USER_DEPOSIT_SAVE: SUB_SNAKE_C_START + 5,
    SUB_SNAKE_C_USER_DEPOSIT_DRAW: SUB_SNAKE_C_START + 6,
    SUB_SNAKE_C_TASK_LIST: SUB_SNAKE_C_START + 7,
    SUB_SNAKE_C_TASK_DRAW: SUB_SNAKE_C_START + 8,
    SUB_SNAKE_C_SHARE_GAME: SUB_SNAKE_C_START + 9,
    SUB_SNAKE_C_USER_DEPOSIT_DRAW_CHECK: SUB_SNAKE_C_START + 10,
    
    SUB_SNAKE_C_GAME_LOG: SUB_SNAKE_C_START + 50,
    SUB_SNAKE_C_MANDATE: SUB_SNAKE_C_START + 99,

    SUB_SNAKE_S_USER_INFO: SUB_SNAKE_S_START + 1,
    SUB_SNAKE_S_GAME_ERROR: SUB_SNAKE_S_START + 2,
    SUB_SNAKE_S_GAME_INIT: SUB_SNAKE_S_START + 3,
    SUB_SNAKE_S_GAME_STEP: SUB_SNAKE_S_START + 4,
    SUB_SNAKE_S_GAME_RESULT: SUB_SNAKE_S_START + 5,
    SUB_SNAKE_S_USER_DEPOSIT_INFO: SUB_SNAKE_S_START + 6,
    SUB_SNAKE_S_USER_DEPOSIT_SAVE_RESULT: SUB_SNAKE_S_START + 7,
    SUB_SNAKE_S_USER_DEPOSIT_DRAW_RESULT: SUB_SNAKE_S_START + 8,
    SUB_SNAKE_S_TASK_LIST: SUB_SNAKE_C_START + 9,
    SUB_SNAKE_S_TASK_DRAW_RESULT: SUB_SNAKE_C_START + 10,
    SUB_SNAKE_S_SHARE_GAME_RESULT: SUB_SNAKE_C_START + 11,
    SUB_SNAKE_S_USER_DEPOSIT_DRAW_CHECK_RESULT: SUB_SNAKE_C_START + 12,
};

var MSG_PB = {

};

var Class = cc.Class({
    name: "LXGameMessager",

    statics: {
        initialized: false,

        init: function (callback) {
            if (this.initialized) {
                callback && callback();
            };
            var total = 1;
            var done = function () {
                if (--total <=  0) {
                    this.initialized = true;
                    callback && callback();
                }
            }.bind(this);
            cc.loader.loadRes('pb/SnakePB', function (err, res){
                var builder = ProtoBuf.protoFromString(res);

                MSG_PB.Snake_C_Enter = builder.build('Snake_C_Enter');
                MSG_PB.Snake_C_Control = builder.build('Snake_C_Control');
                MSG_PB.Snake_C_UserDepositSave = builder.build('Snake_C_UserDepositSave');
                MSG_PB.Snake_C_TaskDraw = builder.build('Snake_C_TaskDraw');

                MSG_PB.Snake_C_GameLog = builder.build('Snake_C_GameLog');
                
                MSG_PB.Snake_S_UserInfo = builder.build('Snake_S_UserInfo');
                MSG_PB.Snake_S_CommonResult = builder.build('Snake_S_CommonResult');
                MSG_PB.Snake_S_GameError = builder.build('Snake_S_GameError');
                MSG_PB.Snake_S_GameInfo = builder.build('Snake_S_GameInfo');
                MSG_PB.Snake_S_GameStep = builder.build('Snake_S_GameStep');
                MSG_PB.Snake_S_GameFrame = builder.build('Snake_S_GameFrame');
                MSG_PB.Snake_S_SnakeInfo = builder.build('Snake_S_SnakeInfo');
                MSG_PB.Snake_S_SnakeTrack = builder.build('Snake_S_SnakeTrack');
                MSG_PB.Snake_S_FoodInfo = builder.build('Snake_S_FoodInfo');
                MSG_PB.Snake_S_GameResult = builder.build('Snake_S_GameResult');
                MSG_PB.Snake_S_UserDepositInfo = builder.build('Snake_S_UserDepositInfo');
                MSG_PB.Snake_S_UserDepositSaveOrder = builder.build('Snake_S_UserDepositSaveOrder');
                MSG_PB.Snake_S_UserDepositSaveResult = builder.build('Snake_S_UserDepositSaveResult');
                MSG_PB.Snake_S_UserDepositDrawResult = builder.build('Snake_S_UserDepositDrawResult');
                MSG_PB.Snake_S_TaskInfo = builder.build('Snake_S_TaskInfo');
                MSG_PB.Snake_S_TaskInfoList = builder.build('Snake_S_TaskInfoList');
                MSG_PB.Snake_S_TaskDrawResult = builder.build('Snake_S_TaskDrawResult');
                done();
            }.bind(this));
        },
    },

    ctor: function () {
        this.connector = null;
    },

    parseMsg: function (mainCmd, subCmd, body) {
        switch (mainCmd) {
            case MSG_CMD.MDM_CS_GAME_LOGIC: 
                this.parseGameMsg(subCmd, body);
                break;
            default: break;
        }
    },

    parseGameMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.SUB_SNAKE_S_USER_INFO:
                var pbData = MSG_PB.Snake_S_UserInfo.decode(body);
                var data = {
                    id: pbData.get('id'),
                    nick: pbData.get('nick'),
                    stone: pbData.get('stone') != null ? pbData.get('stone').toNumber() : null,
                    mapID: pbData.get('mapID'),
                };
                this.emit('userInfo', data);
            break; 
            case MSG_CMD.SUB_SNAKE_S_GAME_ERROR:
                var pbData = MSG_PB.Snake_S_GameError.decode(body);
                var data = {
                    code: pbData.get('code'),
                    msg: pbData.get('msg'),
                    level: pbData.get('level'),
                };
                this.emit('gameError', data);
                break; 
            case MSG_CMD.SUB_SNAKE_S_GAME_INIT: 
                var pbData = MSG_PB.Snake_S_GameInfo.decode(body);
                // cc.log('SUB_SNAKE_S_GAME_INIT', body.byteLength, pbData);
                var part = pbData.get('part');
                var data = {part: part}
                switch(part) {
                    case 1:
                        data.mapWidth = pbData.get('mapWidth');
                        data.mapHeight = pbData.get('mapHeight');
                        data.frameRate = pbData.get('frameRate');
                        data.stepTime = pbData.get('stepTime');
                        var pbSnakeConfig = pbData.get('snakeConfig');
                        data.snakeConfig = {
                            SPEED: pbSnakeConfig.get('SPEED'),
                            ANGLE_SPEED: pbSnakeConfig.get('ANGLE_SPEED'),
                            MIN_LENGTH: pbSnakeConfig.get('MIN_LENGTH'),
                            MAX_LENGTH: pbSnakeConfig.get('MAX_LENGTH'),
                            SCORE_LENGTH_RATIO: pbSnakeConfig.get('SCORE_LENGTH_RATIO'),
                            RADIUS: pbSnakeConfig.get('RADIUS'),
                            LAG: pbSnakeConfig.get('LAG'),
                        };
                        var pbFoodConfig = pbData.get('foodConfig');
                        data.foodConfig = {
                            MIN_RADIUS: pbFoodConfig.get('MIN_RADIUS'),
                            MAX_RADIUS: pbFoodConfig.get('MAX_RADIUS'),
                            SCORE_RADIUS_RATIO: pbFoodConfig.get('SCORE_RADIUS_RATIO'),
                            RANDOM_SKINS: pbFoodConfig.get('RANDOM_SKINS'),
                            RANDOM_RATES: pbFoodConfig.get('RANDOM_RATES'),
                        };
                        data.foodRandomSeed = pbData.get('foodRandomSeed') != null ? pbData.get('foodRandomSeed').toNumber() : null;
                        break;
                    case 2:
                        data.snakes = this.parseSnakes(pbData.get('snakes'));
                        data.foods = this.parseFoods(pbData.get('foods'));
                        break;
                }
                this.emit('gameInit', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_GAME_STEP: 
                var pbData = MSG_PB.Snake_S_GameStep.decode(body);
                // cc.log('SUB_SNAKE_S_GAME_STEP', body.byteLength, pbData);
                var data = {};
                var frames = data.frames = [];
                var pbFrames = pbData.get('frames') || [];
                for (var i = 0, len = pbFrames.length; i < len; i++) {
                    var pbFrame = pbFrames[i];
                    var frame = {
                        snakes: this.parseSnakes(pbFrame.snakes),
                        foods: this.parseFoods(pbFrame.foods),
                    };
                    frames.push(frame);
                }
                data.id = pbData.get('id');
                data.randomFoodNum = pbData.get('randomFoodNum');
                data.foodRandomSeed = pbData.get('foodRandomSeed') != null ? pbData.get('foodRandomSeed').toNumber() : null;
                this.emit('gameStep', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_GAME_RESULT: 
                var pbData = MSG_PB.Snake_S_GameResult.decode(body);
                var data = {
                    id: pbData.get('id'),
                    score: pbData.get('score'),
                    kills: pbData.get('kills'),
                };
                var pbDepositSaveOrder = pbData.get('depositSaveOrder');
                if (pbDepositSaveOrder) {
                    var depositSaveOrder = {
                        id: pbDepositSaveOrder.get('id'),
                        stone: pbDepositSaveOrder.get('stone') != null ? pbDepositSaveOrder.get('stone').toNumber() : null,
                        status: pbDepositSaveOrder.get('status'),
                        msg: pbDepositSaveOrder.get('msg'),
                    };
                    data.depositSaveOrder = depositSaveOrder;
                }
                this.emit('gameResult', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_USER_DEPOSIT_INFO: 
                var pbData = MSG_PB.Snake_S_UserDepositInfo.decode(body);
                var data = {
                    stone: pbData.get('stone') != null ? pbData.get('stone').toNumber() : null,
                    saveChance: pbData.get('saveChance'),
                    drawLimit: pbData.get('drawLimit') != null ? pbData.get('drawLimit').toNumber() : null,
                };
                this.emit('depositInfo', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_USER_DEPOSIT_SAVE_RESULT: 
                var pbData = MSG_PB.Snake_S_UserDepositSaveResult.decode(body);
                var data = {
                    isSucc: pbData.get('isSucc'),
                    msg: pbData.get('msg'),
                };
                var pbDepositSaveOrder = pbData.get('order');
                if (pbDepositSaveOrder) {
                    var depositSaveOrder = {
                        id: pbDepositSaveOrder.get('id'),
                        stone: pbDepositSaveOrder.get('stone') != null ? pbDepositSaveOrder.get('stone').toNumber() : null,
                        status: pbDepositSaveOrder.get('status'),
                        msg: pbDepositSaveOrder.get('msg'),
                    };
                    data.depositSaveOrder = depositSaveOrder;
                }
                this.emit('depositSaveResult', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_USER_DEPOSIT_DRAW_RESULT: 
                var pbData = MSG_PB.Snake_S_UserDepositDrawResult.decode(body);
                var data = {
                    isSucc: pbData.get('isSucc'),
                    msg: pbData.get('msg'),
                    userStone: pbData.get('userStone') != null ? pbData.get('userStone').toNumber() : null,
                };
                this.emit('depositDrawResult', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_TASK_LIST: 
                var pbData = MSG_PB.Snake_S_TaskInfoList.decode(body);
                var pbTasks = pbData.tasks || [];
                var tasks = [];
                for (var i = 0, len = pbTasks.length; i < len; i++) {
                    tasks.push(this.parseTask(pbTasks[i]));
                }
                var data = {tasks: tasks}
                this.emit('taskList', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_TASK_DRAW_RESULT: 
                var pbData = MSG_PB.Snake_S_TaskDrawResult.decode(body);
                var data = {
                    isSucc: pbData.get('isSucc'),
                    msg: pbData.get('msg'),
                    task: this.parseTask(pbData.get('task')),
                };
                this.emit('taskDrawResult', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_SHARE_GAME_RESULT:
                var pbData = MSG_PB.Snake_S_CommonResult.decode(body);
                var data = {
                    isSucc: pbData.get('isSucc'),
                    msg: pbData.get('msg'),
                };
                this.emit('shareGameResult', data);
                break;
            case MSG_CMD.SUB_SNAKE_S_USER_DEPOSIT_DRAW_CHECK_RESULT: 
                var pbData = MSG_PB.Snake_S_CommonResult.decode(body);
                var data = {
                    isSucc: pbData.get('isSucc'),
                    msg: pbData.get('msg'),
                };
                this.emit('depositDrawCheckResult', data);
                break;
        }
    },

    parseTask: function (pbTask) {
        if (!pbTask)
            return null;
        var task = {
            taskID: pbTask.get('taskID'),
            content: pbTask.get('content'),
            opType: pbTask.get('opType'),
            opParam: pbTask.get('opParam'),
            needValue: pbTask.get('needValue'),
            currValue: pbTask.get('currValue'),
            status: pbTask.get('status'),
        };
        return task;
    },

    parseSnakes: function (pbSnakes) {
        if (!pbSnakes || pbSnakes.length <= 0)
            return [];
        var snakes  = [];
        for (var i = 0, len = pbSnakes.length; i < len; i++) {
            var pbSnake = pbSnakes[i];
            var snake = {
                id: pbSnake.get('id'),
            };
            if(pbSnake.get('nick') != null)
                snake.nick = pbSnake.get('nick');
            if(pbSnake.get('skin') != null)
                snake.skin = pbSnake.get('skin');
            if(pbSnake.get('score') != null)
                snake.score = pbSnake.get('score');
            if(pbSnake.get('kills') != null)
                snake.kills = pbSnake.get('kills')
            if(pbSnake.get('isSpeedUp') != null)
                snake.isSpeedUp = pbSnake.get('isSpeedUp');
            if(pbSnake.get('hasShield') != null)
                snake.hasShield = pbSnake.get('hasShield');
            if(pbSnake.get('isDead') != null)
                snake.isDead = pbSnake.get('isDead');
            if(pbSnake.get('killerID') != null)
                snake.killerID = pbSnake.get('killerID');;
            if(pbSnake.get('toDegree') != null)
                snake.toDegree = pbSnake.get('toDegree');
            var tracks = snake.tracks = [];
            var pbTracks = pbSnake.get('tracks') || [];
            for (var j = 0, len2 = pbTracks.length; j < len2; j++) {
                var pbTrack = pbTracks[j];
                var pos = pbTrack.get('pos');
                tracks.push({
                    posX: pos >> 16,
                    posY: parseInt('0000ffff',16) & pos,
                    degree: pbTrack.get('degree'),
                });
            }
            var foods = snake.foods = [];
            var pbFoods = pbSnake.get('foods') || [];
            for (var j = 0, len2 = pbFoods.length; j < len2; j++) {
                var pbFood = pbFoods[j];
                foods.push({
                    id: pbFood.get('pos'),
                });
            }
            snakes.push(snake);
        }
        return snakes;
    },

    parseFoods: function (pbFoods) {
        if (!pbFoods || pbFoods.length <= 0)
            return [];
        var foods = [];
        for (var i = 0, len = pbFoods.length; i < len; i++) {
            var pbFood = pbFoods[i];
            var pos = pbFood.get('pos');
            var food = {
                id: pos,
                skin: pbFood.get('skin'),
                score: pbFood.get('score'),
                posX: pos >> 16,
                posY: parseInt('0000ffff',16) & pos,
            };
            if (pbFood.get('degree') != null)
                food.degree = pbFood.get('degree');
            foods.push(food);
        }
        return foods;
    },
    
    send: function (type, data) {
        var connector = this.connector;
        switch (type) {
            case 'enter': 
                data = data || {mapID: 0};
                var pbData = new MSG_PB.Snake_C_Enter();
                pbData.set('mapID', data.mapID);
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_ENTER, pbData.encode().toArrayBuffer());
                break;
            case 'quit': 
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_QUIT);
                break;
            case 'control':
                var pbData = new MSG_PB.Snake_C_Control();
                pbData.set('toDegree', data.toDegree);
                pbData.set('isSpeedUp', data.isSpeedUp);
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_CONTROL, pbData.encode().toArrayBuffer());
                break;
            case 'revive':
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_REVIVE);
                break;
            case 'mandate':
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_MANDATE);
                break;
            case 'log':
                var pbData = new MSG_PB.Snake_C_GameLog();
                pbData.set('remark', data.remark);
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_GAME_LOG, pbData.encode().toArrayBuffer());
                break;
            case 'depositSave':
                var pbData = new MSG_PB.Snake_C_UserDepositSave();
                pbData.set('orderID', data.orderID);
                pbData.set('type', data.type);
                var accountInfo = connector.getAccountInfo();
                pbData.set('account', accountInfo.account);
                pbData.set('password', accountInfo.password);
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_USER_DEPOSIT_SAVE, pbData.encode().toArrayBuffer());
                break;
            case 'depositDraw': 
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_USER_DEPOSIT_DRAW);
                break;
            case 'taskList': 
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_TASK_LIST);
                break;
            case 'taskDraw':
                var pbData = new MSG_PB.Snake_C_TaskDraw();
                pbData.set('taskID', data.taskID);
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_TASK_DRAW, pbData.encode().toArrayBuffer());
                break;
            case 'shareGame':
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_SHARE_GAME);
                break;
            case 'depositDrawCheck':
                connector.sendMsg(MSG_CMD.MDM_CS_GAME_LOGIC, MSG_CMD.SUB_SNAKE_C_USER_DEPOSIT_DRAW_CHECK);
                break;
        }
    },

    emit: function (message, detail) {
        this.connector.emit(message, detail);
    },
});

module.exports = Class;