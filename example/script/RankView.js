cc.Class({
    extends: cc.Component,

    properties: {
        itemRefab: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        
    },

    reset: function () {
        if (!this.items) {
            var node = this.node;
            var prefab = this.itemRefab;
            var items = this.items = [];
            for (var i = 0, len = 10; i < len; i++) {
                var item = items[i] = cc.instantiate(prefab);
                var color = cc.color(255, 255, 255);
                if (i < 3) {
                    switch (i) {
                        case 0: color = cc.color(255, 64, 64); break;
                        case 1: color = cc.color(255, 128, 64); break;
                        case 2: color = cc.color(255, 128, 128); break;
                    }
                } else {
                    switch (i % 2) {
                        case 0: color = cc.color(64, 128, 128); break;
                        case 1: color = cc.color(64, 128, 64); break;
                    }
                }
                var labels = item.getComponentsInChildren(cc.Label);
                for (var j = 0, len2 = labels.length; j < len2; j++) {
                    labels[j].node.color = color;
                }
                node.addChild(item);
            };
        }
        this.showRanks();
    },

    showRanks: function (ranks) {
        ranks = ranks || [];
        var items = this.items;
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            var lbRank = item.getChildByName('lb_rank').getComponent(cc.Label);
            var lbNick = item.getChildByName('lb_nick').getComponent(cc.Label);
            var lbScore = item.getChildByName('lb_score').getComponent(cc.Label);
            var rank = ranks[i];
            if (rank) {
                lbRank.string = i + 1;
                lbNick.string = rank.nick;
                lbScore.string = rank.score;
            } else {
                lbRank.string = '';
                lbNick.string = '';
                lbScore.string = '';
            }
        }
    },
});
