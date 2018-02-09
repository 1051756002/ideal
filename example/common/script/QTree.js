var MAX_LEVEL = 5;
var MAX_LEAVES = 100;

var QTree = function (x, y, width, height, level) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.level = level || 0;

    this.branches = [];
    this.leaves = [];

    this.maxLevel = MAX_LEVEL;
    this.maxLeaves = MAX_LEAVES;
};

QTree.prototype.clear = function () {
    this.leaves.splice(0);
    var branches = this.branches;
    for (var i = 0, len = branches.length; i < len; i++) {
        branches[i].clear();
    }
    branches.splice(0);
};

QTree.prototype.split = function () {
    var level = this.level + 1;
    var x = this.x;
    var y = this.y;
    var hw = this.width / 2 | 0;
    var hh = this.height / 2 | 0;
    var branches = this.branches;
    branches[0] = new QTree(x + hw, y + hh, hw, hh, level);
    branches[1] = new QTree(x, y + hh, hw, hh, level);
    branches[2] = new QTree(x, y, hw, hh, level);
    branches[3] = new QTree(x + hw, y, hw, hh, level);
};

QTree.prototype.getIndex = function (leaf) {
    var index = -1;

    var x = this.x;
    var y = this.y;
    var w = this.width;
    var h = this.height;
    var mx = x + w / 2;
    var my = y + w / 2;

    var lx = leaf.x;
    var ly = leaf.y;
    var lw = leaf.width;
    var lh = leaf.height;

    var isInLeft = (lx > x && lx + lw < mx);
    var isInRight = (lx > mx && lx + lw < x + w);
    var isInBottom = (ly > y && ly + lh < my);
    var isInTop = (ly > my && ly + lh < y + h);

    if (isInRight && isInTop)
        index = 0;
    else if (isInLeft && isInTop)
        index = 1;
    else if (isInLeft && isInBottom)
        index = 2;
    else if (isInRight && isInBottom)
        index = 3;

    return index;
};

QTree.prototype.insert = function (leaf) {
    if (!leaf)
        return;
    var branches = this.branches;
    if (branches.length > 0) {
        var index = this.getIndex(leaf);
        if (index != -1) {
            branches[index].insert(leaf);
            return;
        }
    }
    var leaves = this.leaves;
    leaves.push(leaf);
    leaf.parent = this;
    if (leaves.length > this.maxLeaves && this.level < this.maxLevel) {
        if (branches.length == 0) {
            this.split();
        }
        var i = 0;
        while (i < leaves.length) {
            var index = this.getIndex(leaves[i]);
            if (index != -1) {
                branches[index].insert((leaves.splice(i, 1))[0]);
                continue;
            }
            i++;
        }
    }
};

QTree.prototype.remove = function (leaf) {
    if (!leaf)
        return;
    if (leaf.parent) {
        var leaves = leaf.parent.leaves;
        for (var i = 0, len = leaves.length; i < len; i++) {
            if (leaf == leaves[i]) {
                leaves.splice(i, 0);
                return;
            }
        }
    }
    var branches = this.branches;
    if (branches.length > 0) {
        var index = this.getIndex(leaf);
        if (index != -1) {
            branches[index].remove(leaf);
            return;
        }
    }
    var leaves = this.leaves;
    for (var i = 0, len = leaves.length; i < len; i++) {
        if (leaf == leaves[i]) {
            leaves.splice(i, 0);
            return;
        }
    }
};

QTree.prototype.retrieve = function (leaf) {
    var result = [];
    if (!leaf)
        return result;
    var index = this.getIndex(leaf);
    var branches = this.branches;
    if (index != -1 && branches.length) {
        result = result.concat(branches[index].retrieve(leaf));
    }
    var leaves = this.leaves;
    for (var i = 0, len = leaves.length; i < len; i++) {
        result.push(leaves[i]);
    }
    return result;
};

var QTreeLeaf = QTree.QTreeLeaf = function (x, y, width, height, obj) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.obj = obj;
};

module.exports = QTree;
