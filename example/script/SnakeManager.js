var Snake = require('Snake');
var GameMap = require('GameMap');
var FoodManager = require('FoodManager');

cc.Class({
    extends: cc.Component,

    properties: {
        snakePrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.map = this.getComponent(GameMap);
    },

    reset: function () {
        var snakes = this.snakes;
        if (snakes) {
            for (var p in snakes) {
                if (!snakes.hasOwnProperty(p))
                    continue;
                var snake = snakes[p];
                snake.node.destroy();
            }
        }
        this.snakes = {};
        this.unscheduleAllCallbacks();
    },

    setConfig: function (config) {
        Snake.setConfig(config);
    },

    updatePerStep: function (step) {
        
    },

    updatePerFrame: function (frame) {
        this.updateSnakes(frame.snakes, true);
    },

    updateSnakes: function (sSnakes, inFrame) {
        sSnakes = sSnakes || [];
        var foodManager = this.getComponent(FoodManager);
        var deadSnakes = [];
        for (var i = 0, len = sSnakes.length; i < len; i++) {
            var sSnake = sSnakes[i];
            var snake = this.findSnake(sSnake.id);
            if (!snake) {
                snake = this.addSnake(sSnake);
            } else {
                snake.parseData(sSnake);
                if (!sSnake.tracks || sSnake.tracks.length == 0) {
                    snake.move();
                }
            }
            var sFoods = sSnake.foods || [];
            for (var j = 0, len2 = sFoods.length; j < len2; j++) {
                var sFood = sFoods[j];
                var food = foodManager.findFood(sFood.id);
                if (!food) {
                    var checks = [];
                    var id = sFood.id;
                    var pos = cc.p(id >> 16, parseInt('0000ffff',16) & id);
                    var foods = foodManager.foods;
                    for (var p in foods) {
                        if (!foods.hasOwnProperty(p))
                            continue;
                        var food = foods[p];
                        var distance = cc.pDistance(pos, food.node.position);
                        checks.push({distance: distance, id: food.id, pos: food.node.position});
                    }
                    checks.sort(function (a, b) {
                        return a.distance - b.distance;
                    });
                    throw({
                        remark: 'updateSnakes miss food',
                        id: id,
                        pos: pos,
                        checks: checks.slice(0, 3),
                    });
                    // cc.log('updateSnakes miss food', id, pos, checks.slice(0, 3));
                    // continue;
                }
                foodManager.removeFood(food.id);
                food.disappearTo(snake.getPos());
            }
            if (snake.isDead) {
                deadSnakes.push(snake);
            }
            if (inFrame)
                snake.hasChanged = true;
        }
        var map = this.map;
        var snakes = this.snakes;
        for (var p in snakes) {
            if (!snakes.hasOwnProperty(p))
                continue;
            var snake = snakes[p];
            if (inFrame) {
                if (!snake.hasChanged)
                    snake.move();
                snake.hasChanged = false;
            }
            snake.refresh();
            var visible = map.checkRegionVisisble(snake.getOutline());
            map.setObjVisible(snake.node, visible, 0);
            if (visible) {
                snake.setVisibleRegion(map.visibleRegion);
            }
        }
        for (var i = 0, len = deadSnakes.length; i < len; i++) {
            var snake = deadSnakes[i];
            this.removeSnake(snake.id);
            snake.disappear();
            this.node.emit('snakeDie', {snake: snake});
        }
    },

    addSnake: function (sSnake) {
        var prefab = this.snakePrefab;
        var node = cc.instantiate(prefab)
        var snake = node.getComponent(Snake);
        snake.parseData(sSnake);
        var map = this.map;
        map.addObj(node);
        map.setObjVisible(node, false);
        node.on('disappear', function (evt) {
            var data = evt instanceof cc.Event ? evt.detail : evt;
            node.targetOff(this);
            this.scheduleOnce(function () {
                map.removeObj(node);
                node.destroy();
            }, data.delay);
        }, this);
        this.snakes[sSnake.id.toString()] = snake;
        this.node.emit('snakeBorn', {snake: snake});
        return snake;
    },

    removeSnake: function (id) {
        var snakes = this.snakes;
        var snake = this.snakes[id.toString()];
        if (!snake)
            return;
        delete snakes[id.toString()];
    },

    findSnake: function (id) {
        return this.snakes[id.toString()];
    },

    getRanks: function () {
        var ranks = [];
        var snakes = this.snakes;
        for (var p in snakes) {
            if (!snakes.hasOwnProperty(p))
                continue;
            var snake = snakes[p];
            ranks.push({nick: snake.nick, score: snake.score});
        }
        for (var i = 0, len = ranks.length; i < len; i++) {
            for (var j = 0, len2 = ranks.length - i - 1; j < len2; j++) {
                if (ranks[j].score >= ranks[j + 1].score)
                    continue;
                var temp = ranks[j];
                ranks[j] = ranks[j + 1];
                ranks[j + 1] = temp;
            }
        }
        return ranks;
    },
});
