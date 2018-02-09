var GameConn = require('GameConn');

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        this.reset();
    },

    reset: function () {
        this.conns = [];
    },

    update: function () {

    },

    connect: function (id, nick) {
        var node = new cc.Node();
        this.node.addChild(node);
        var conn = node.addComponent(GameConn);
        if (conn) {
            conn.server = this;
            conn.id = id;
            conn.nick = nick;
        }
        this.conns.push(conn);
        return conn;
    },

    findConn: function (id) {
        var conns = this.conns;
        for (var i = 0, len = conns.length; i < len; i++) {
            var conn = conns[i];
            if (conn.id == id)
                return conn;
        }
        return null;
    },

    send: function (conn, type, data) {
        if (conn) {
            if (typeof conn == 'number')
                conn = this.findConn(conn);
            if (conn)
                conn.recv(type, data);
        } else {
            var snakes = this.snakeManager.snakes;
            for (var i = 0, len = snakes.length; i < len; i++) {
                conn = this.findConn(snakes[i].id);
                if (conn)
                    conn.recv(type, data);
            }
        }
    },

    recv: function (conn, type, data) {
        switch(type) {

        }
    },
});
