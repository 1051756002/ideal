var Snake = require('Snake');
var Food = require('Food');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        this.container = this.node.getChildByName('container');
        this.container_food = this.node.getChildByName('container_food');
        this.container_snake = this.node.getChildByName('container_snake');
    },
    
    reset: function () {
        this.setSize(0, 0);
        this.setTracer(null);
        this.objs = {};
        this.container.removeAllChildren();
        this.container_food.removeAllChildren();
        this.container_snake.removeAllChildren();
        this.unscheduleAllCallbacks();
    },

    setSize: function (width, height) {
        var node = this.node;
        node.width = this.width = width;
        node.height = this.height = height;
        node.active = !(width == 0 && height == 0);

        var viewSize = cc.director.getVisibleSize();
        var blockWidth = this.blockWidth = Math.ceil(viewSize.width / 2);
        var blockHeight = this.blockHeight = Math.ceil(viewSize.height / 2);
        var blockRows = this.blockRows = Math.ceil(height / blockHeight);
        var blockCols = this.blockCols = Math.ceil(width / blockWidth);
        var blocks = this.blocks = [];
        for (var i = 0; i < blockRows; i++) {
            blocks[i] = [];
            for (var j = 0; j < blockCols; j++) {
                blocks[i][j] = {
                    row: i,
                    col: j,
                    nodes: [],
                    visible: true,
                };
            }
        }
        this.setVisbleRegion(cc.rect(0, 0, width, height));
    },
    
    checkRegionVisisble: function (rect) {
        var visibleRegion = this.visibleRegion;
        if (!rect || !visibleRegion || rect.width <= 0 || rect.height <= 0)
            return false;
        return cc.rectIntersectsRect(rect, this.visibleRegion);
    },

    setVisbleRegion: function (rect) {
        if (!rect)
            return;
        this.visibleRegion = rect;
        var blockWidth = this.blockWidth;
        var blockHeight = this.blockHeight;
        var blockRows = this.blockRows;
        var blockCols = this.blockCols;
        var minRow = Math.floor(rect.yMin / blockHeight);
        var maxRow = Math.floor(rect.yMax / blockHeight);
        var minCol = Math.floor(rect.xMin / blockWidth);
        var maxCol = Math.floor(rect.xMax / blockWidth);
        var blocks = this.blocks;
        for (var i = 0; i < blockRows; i++) {
            for (var j = 0; j < blockCols; j++) {
                var block = blocks[i][j];
                if (i < minRow || i > maxRow || j < minCol || j > maxCol)
                    this.setBlockVisble(block, false);
                else
                    this.setBlockVisble(block, true);
            }
        }
    },

    setBlockVisble: function (block, visible) {
        if (block.visible == visible)
            return;
        block.visible = visible;
        var nodes = block.nodes;
        for (var i = 0, len = nodes.length; i < len; i++) {
            this.setObjVisible(nodes[i], visible);
        }
    },

    getBlock: function (pos) {
        if (!pos)
            return null;
        var width = this.width;
        var height = this.height;
        var blockWidth = this.blockWidth;
        var blockHeight = this.blockHeight;
        var row = Math.floor(pos.y / blockHeight);
        var col = Math.floor(pos.x / blockWidth);
        var blocks = this.blocks;
        if (!blocks[row])
            return null;
        return blocks[row][col];
    },

    addToBlock: function (node) {
        var key = node.uuid.toString();
        var obj = this.objs[key];
        if (!obj)
            return;
        if (obj.block)
            this.removeFromBlock(node);
        var pos = node.position;
        var block = this.getBlock(pos);
        if (!block)
            return;
        block.nodes.push(node);
        obj.block = block;
        this.setObjVisible(node, block.visible);
    },

    removeFromBlock: function (node) {
        var key = node.uuid.toString();
        var obj = this.objs[key];
        if (!obj)
            return;
        var block = obj.block;
        if (!block)
            return;
        var nodes = block.nodes;
        for (var i = 0, len = nodes.length; i < len; i++) {
            if (nodes[i] != node)
                continue;
            nodes.splice(i, 1);
            node.active = true;
            break;
        }
    },

    addObj: function (node) {
        var key = node.uuid.toString();
        var objs = this.objs;
        var obj = objs[key];
        if (obj)
            this.removeObj(node);
        var container = this.container;
        if (node.getComponent(Food))
            container = this.container_food;
        else if (node.getComponent(Snake))
            container = this.container_snake;
        obj = objs[key] = {
            node: node,
            block: null,
            container: container,
        }; 
        container.addChild(node);
    },

    removeObj: function (node) {
        var key = node.uuid.toString();
        var objs = this.objs;
        var obj = objs[key];
        if (!obj)
            return;
        if (obj.block) {
            this.removeFromBlock(node);
        }
        node.removeFromParent();
        delete objs[key];
    },

    setObjVisible: function (node, visible, delay) {
        var key = node.uuid.toString();
        var obj = this.objs[key];
        if (!obj)
            return;
        // node.active = visible;
        var container = obj.container;
        if (!visible) {
            node.removeFromParent();
        } else if (!node.parent) {
            container.addChild(node);
            if (typeof delay == 'number') {
                node.active = false;
                this.scheduleOnce(function () {
                    node.active = true;
                }, delay);
            }
        }
    },

    setTracer: function (tracer) {
        this.tracer = tracer;
        this.trace();
    },

    trace: function () {
        var tracer = this.tracer;
        if (!tracer)
            return;
        var node = this.node;
        var pos = tracer.position;
        var viewSize = cc.director.getVisibleSize();
        pos.x -= viewSize.width / 2;
        pos.y -= viewSize.height / 2;
        var bgRect = node.getChildByName('bg').getBoundingBox();
        var minX = bgRect.xMin;
        var maxX = bgRect.xMax - viewSize.width;
        var minY = bgRect.yMin;
        var maxY = bgRect.yMax - viewSize.height;
        if (pos.x < minX)
            pos.x = minX;
        else if (pos.x > maxX)
            pos.x = maxX;
        if (pos.y < minY)
            pos.y = minY;
        else if (pos.y > maxY)
            pos.y = maxY;
        node.position = cc.p(-pos.x, -pos.y);
        var margin = 100;
        this.setVisbleRegion(cc.rect(pos.x - margin, pos.y - margin, viewSize.width + margin, viewSize.height + margin));
    },
});
