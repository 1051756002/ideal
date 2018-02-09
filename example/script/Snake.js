var SnakeBody = require('SnakeBody');

var Snake = cc.Class({
    extends: cc.Component,

    properties: {
        bodyPrefab: cc.Prefab,
    },

    statics: {
        SPEED: 0,
        ANGLE_SPEED: 0,
        MIN_LENGTH: 0,
        MAX_LENGTH: 0,
        SCORE_LENGTH_RATIO: 0,
        RADIUS: 0,
        LAG: 0,
        setConfig: function (config) {
            cc.js.mixin(Snake, config);
        },
    },

    ctor: function () {
        this.bodies = [];
        this.id = 0;
        this.nick = '';
        this.score = 0;
        this.isSpeedUp = false;
        this.hasShield = false;
        this.tracks = [];
    },

    move: function () {
        if (this.isDead)
            return;
        var tracks = this.tracks;
        var track = tracks[0];
        if (!track)
            return;
        var toDegree = this.toDegree;
        var isSpeedUp = this.isSpeedUp;
        for (var i = 0, len = (isSpeedUp ? 2 : 1); i < len; i++) {
            var track = this.nextTrack(track, toDegree);
            tracks.unshift(track);
        }
    },

    nextTrack: function (track, toDegree) {
        var speed = Snake.SPEED;
        var angleSpeed = Snake.ANGLE_SPEED;
        var degree = track.degree;
        var posX = track.posX;
        var posY = track.posY;
        var diffDegree = toDegree - degree;
        if (diffDegree != 0) {
            if (Math.abs(diffDegree) > 180)
                diffDegree = Math.sign(diffDegree)*(Math.abs(diffDegree) - 360);
            if (Math.abs(diffDegree) > angleSpeed)
                diffDegree = Math.sign(diffDegree) * angleSpeed;
            degree = ((degree + diffDegree) + 360) % 360;
        }
        posX += speed * Math.cos(degree * (Math.PI / 180));
        posY += speed * Math.sin(degree * (Math.PI / 180));
        posX = Math.round(posX);
        posY = Math.round(posY);
        return {posX: posX, posY: posY, degree: degree};
    },

    fillTracks: function (tracks) {
        var result = [];
        tracks = tracks || [];
        var lag = Snake.LAG;
        for (var i = tracks.length - 1; i >= 0; i--) {
            var track = tracks[i];
            result.unshift(track);
            if (i == 0)
                break;
            var toTrack = tracks[i - 1];
            for (var j = 1; j < lag; j++) {
                track = this.nextTrack(track, toTrack.degree);
                result.unshift(track);
            }
        }
        return result.slice();
    },

    /*verifyTracks: function (num) {
        var tracks = this.tracks.slice(0, num + 1);
        if (tracks.length < num + 1)
            return;
        for (var i = 0, len = num; i < len; i++) {
            var track = tracks[i];
            var fromTrack = tracks[i + 1];
            var toTrack = this.nextTrack(fromTrack, this.toDegree);
            var isSame = cc.pSameAs(cc.p(track.posX, track.posY), cc.p(toTrack.posX, toTrack.posY));
            if (!isSame) {
                cc.log(this.id, this.isDead, num, this.isSpeedUp, this.toDegree, track, toTrack, fromTrack, isSame);
            }
        }
    },*/

    parseData: function (data) {
        var tracks = this.tracks || [];
        cc.js.mixin(this, data);
        if (tracks != this.tracks)
            tracks = this.tracks = this.tracks.concat(tracks);
        var node = this.node;
        if (typeof data.nick == 'string') {
            node.getChildByName('lb_nick').getComponent(cc.Label).string = data.nick;
            tracks = this.tracks = this.fillTracks(tracks);
        }
    },

    refresh: function () {
        var radius = Snake.RADIUS;
        var lag = Snake.LAG;
        var score = this.score;
        var length = Snake.MIN_LENGTH + Math.floor(score / Snake.SCORE_LENGTH_RATIO);
        if (length > Snake.MAX_LENGTH)
            length = Snake.MAX_LENGTH;
        var bodies = this.bodies;
        if (bodies.length > length) {
            var tempBodies = bodies.splice(length);
            for (var i = 0, len = tempBodies.length; i < len; i++) {
                var body = tempBodies[i];
                body.node.destroy();
            }
        }
        else if (bodies.length < length) {
            if (bodies.length == 0) 
                this.node.getChildByName('lb_nick').position = cc.p(radius + 4, radius + 4);
            for (var i = 0, len = length - bodies.length; i < len; i++) {
                var body = cc.instantiate(this.bodyPrefab).getComponent(SnakeBody);
                body.init(this.skin, bodies.length + 1);
                body.setRadius(radius);
                bodies.push(body);
                this.node.addChild(body.node);
            }
        }
        var node = this.node;
        var tracks = this.tracks || [];
        tracks.splice((length - 1) * lag + 1);
        var lastTrack = null;
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i];
            var track = tracks[i * lag] || lastTrack;
            lastTrack = track;
            if (!track)
                break;
            var pos = cc.p(track.posX, track.posY);
            var degree = track.degree;
            if (i == 0) {
                node.position = pos;
                node.setLocalZOrder(this.skin * -10);
            }
            if (node.parent) {
                pos = cc.pointApplyAffineTransform(pos, node.getParentToNodeTransform());
                body.moveTo(pos, degree);
            }
            if (i == 0)
                this.outline = cc.rect();
            this.calOutline(track);
        }
        this.toggleShiledEffect();
    },

    calOutline: function (track) {
        var outline = this.outline;
        if (!outline) 
            outline = this.outline = cc.rect();
        var radius = Snake.RADIUS;
        var xMin = outline.xMin;
        var xMax = outline.xMax;
        var yMin = outline.yMin;
        var yMax = outline.yMax;
        var xMin_t = track.posX - radius;
        var xMax_t = track.posX + radius;
        var yMin_t = track.posY - radius;
        var yMax_t = track.posY + radius;
        if (xMin == 0 || xMin > xMin_t)
            xMin = xMin_t;
        if (xMax < xMax_t)
            xMax = xMax_t;
        if (yMin == 0 || yMin > yMin_t)
            yMin = yMin_t;
        if (yMax < yMax_t)
            yMax = yMax_t;
        outline.x = xMin;
        outline.width = xMax - xMin;
        outline.y = yMin;
        outline.height = yMax - yMin;
    },

    getOutline: function () {
        var outline = this.outline;
        if (!outline)
            outline = this.outline = cc.rect();
        return outline.clone();
    },

    setVisibleRegion: function (region) {
        if (!region)
            return;
        var node = this.node;
        var bodies = this.bodies;
        var tracks = this.tracks || [];
        var lastTrack = null;
        var radius = Snake.RADIUS;
        var lag = Snake.LAG;
        var rect = cc.rect();
        for (var i = 0, len = bodies.length; i < len; i++) {
            var body = bodies[i];
            var track = tracks[i * lag] || lastTrack;
            lastTrack = track;
            if (!track) 
                break;
            rect.x = track.posX - radius;
            rect.y = track.posY - radius;
            rect.width = rect.height = radius * 2;
            var bodyNode = body.node;
            if (cc.rectIntersectsRect(rect, region)) {
                !bodyNode.parent && node.addChild(bodyNode);
            } else {
                bodyNode.removeFromParent();
            }
        }
    },

    toggleShiledEffect: function () {
        var node = this.node;
        var shield = this.shield;
        if (!shield)
            shield = this.shield = node.getChildByName('shield');
        if (this.hasShield) {
            var rect = this.getOutline();
            if (rect && rect.width > 0 && node.parent) {
                var pos = cc.pointApplyAffineTransform(cc.p(rect.x, rect.y), node.getParentToNodeTransform());
                rect.x = pos.x;
                rect.y = pos.y;
                var center = rect.center;
                var size = (rect.width > rect.height ? rect.width : rect.height) + 4;
                size *= 1.5;
                rect.x = center.x - size / 2;
                rect.y = center.y - size / 2;
                rect.width = rect.height = size;
                shield.setContentSize(rect.width, rect.height);
                shield.position = rect.center;
                !shield.parent && node.addChild(shield);
            }
        } else {
            shield.removeFromParent();
        }
    },

    disappear: function () {
        var node = this.node;
        var delay = 0;
        if (node.isRunning()) {
            delay = 1.0;
            node.runAction(cc.fadeOut(delay));
        }
        node.emit('disappear', {delay: delay});
    },

    getPos: function () {
        return this.node.position;
    },
});
