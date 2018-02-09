var Food = require('Food');
var GameMap = require('GameMap');
var Util = require('Util');

cc.Class({
    extends: cc.Component,

    properties: {
        foodPrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        this.map = this.getComponent(GameMap);
        this.pool = new cc.NodePool(Food);
    },

    reset: function () {
        var foods = this.foods;
        if (foods) {
            for (var p in foods) {
                if (!foods.hasOwnProperty(p))
                    continue;
                var food = foods[p];
                food.node.destroy();
            }
        }
        this.foods = {};
        this.foodRandom = null;
        this.unscheduleAllCallbacks();
    },

    setConfig: function (config) {
        Food.setConfig(config);
    },

    updatePerStep: function (step) {
        var foodRandomSeed = step.foodRandomSeed;
        if (typeof foodRandomSeed == 'number') {
            var foodRandom = this.foodRandom;
            if (foodRandom && foodRandom.seed != foodRandomSeed) {
                throw({
                    remark: 'foodRandomSeed mismatch',
                    sysSeed: foodRandomSeed,
                    currSeed: foodRandom.seed,
                });
                // cc.log('foodRandomSeed mismatch', foodRandomSeed, foodRandom.seed);
            }
            this.setFoodRandomSeed(foodRandomSeed);
        }
        this.addRandomFoods(step.randomFoodNum);
    },

    updatePerFrame: function (frame) {
        this.updateFoods(frame.foods);
    },

    updateFoods: function (sFoods) {
        sFoods = sFoods || [];
        for (var i = 0, len = sFoods.length; i < len; i++) {
            var sFood = sFoods[i];
            var food = this.findFood(sFood.id);
            if (!food) {
                food = this.addFood(sFood);
            } else {
                throw({
                    remark: 'updateFoods duplicate',
                    id: sFood.id,
                });
                // cc.log('updateFoods duplicate', sFood.id);
                // food.parseData(sFood);
            }
        }
    },

    addFood: function (sFood) {
        var pool = this.pool;
        var node = pool.get();
        if (!node)
            node = cc.instantiate(this.foodPrefab);
        var food = node.getComponent(Food);
        food.parseData(sFood);
        var map = this.map;
        map.addObj(node);
        map.addToBlock(node);
        node.on('disappear', function (evt) {
            var data = evt instanceof cc.Event ? evt.detail : evt;
            node.targetOff(this);
            this.scheduleOnce(function () {
                map.removeObj(node);
                if (pool.size() < 50)
                    pool.put(node);
                else
                    node.destroy();
            }, data.delay);
        }, this);
        this.foods[sFood.id.toString()] = food;
        return food;
    },

    removeFood: function (id) {
        var foods = this.foods
        var food = foods[id.toString()];
        if (!food) {
            return;
        }
        this.map.removeFromBlock(food.node);
        delete foods[id.toString()];
    },

    findFood: function (id) {
        return this.foods[id.toString()];
    },

    findPos: function (seedRandom) {
        var map = this.map;
        var padding = Food.MAX_RADIUS * 5;
        var minX = padding;
        var maxX = map.width - padding;
        var minY = padding;
        var maxY = map.height - padding;
        if (!seedRandom) {
            seedRandom = new Util.SeedRandom();
        }
        var x = seedRandom.randInt(minX, maxX);
        var y = seedRandom.randInt(minY, maxY);
        return cc.p(x, y);
    },

    setFoodRandomSeed: function (seed) {
        if (typeof seed != 'number') {
            this.foodRandom = null;
            return;
        }
        this.foodRandom = new Util.SeedRandom(seed);
    },

    addRandomFoods: function (num) {
        if (typeof num != 'number' || num <= 0)
            return;
        var foodRandom = this.foodRandom;
        if (!foodRandom)
            return;
        while (num > 0) {
            var score = 0;
            var rnd = foodRandom.randInt(0, 100);
            var rate = 0;
            for (var i = 0, len = Food.RANDOM_RATES.length; i < len; i++) {
                rate += Food.RANDOM_RATES[i];
                if (rnd < rate) {
                    score = i + 1;
                    break;
                }
            }
            var pos = this.findPos(foodRandom);
            var id = pos.x << 16 | pos.y;
            var skin = Food.RANDOM_SKINS[foodRandom.randInt(0, Food.RANDOM_SKINS.length)];
            if (this.findFood(id))
                continue;
            this.addFood({
                id: id,
                skin: skin,
                score: score,
                posX: pos.x,
                posY: pos.y,
                degree: 0,
            });
            num --;
        }
    },
});
