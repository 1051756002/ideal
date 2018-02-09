var LXLoginMessager = require('LXLoginMessager');
var LXGameMessager = require('LXGameMessager');
var LXUtil = require('LXUtil');

var LOGIN_URL = 'ws://' + LXUtil.SERVER_IP + ':8300';

var DEFAULT_CHANNEL = 0;
var SCENE_IDS = [10001];

var WATING = 0;
var DETECTING = 1;
var CONNECTING = 2;
var CONNECTED = 3;
var RECONNECTING = 4;
var DISCONNECTING = 5;

cc.Class({
    extends: cc.Component,

    statics: {
        WATING: WATING,
        DETECTING: DETECTING,
        CONNECTING: CONNECTING,
        CONNECTED: CONNECTED,
        RECONNECTING: RECONNECTING,
        DISCONNECTING: DISCONNECTING,
    },

    init: function (callback) {
        this.status = WATING;
        this.messagers = {};
        var total = 2;
        var handle = function (callback, target) {
            return function (evt) {
                try {
                    callback && callback.call(target, evt);
                } catch (error) {
                    this.onConnectError({msg: error.message});
                }
            };
        };
        var done = function () {
            if (--total <=  0) {
                this.on('beat', handle(this.onBeat, this), this);
                this.on('loginSuccess', handle(this.onLoginSuccess, this), this);
                this.on('loginFailure', handle(this.onLoginFailure, this), this);
                this.on('serverList', handle(this.onServerList, this), this);
                this.on('serverDetail', handle(this.onServerDetail, this), this);
                this.on('loginServerSuccess', handle(this.onLoginServerSuccess, this), this);
                this.on('loginServerFailure', handle(this.onLoginServerFailure, this), this);
                this.on('reconnectServerSuccess', handle(this.onReconnectServerSuccess, this), this);
                this.on('reconnectServerFailure', handle(this.onReconnectServerFailure, this), this);
                this.on('sysMsg', handle(this.onSysMsg, this), this);
                this.on('gateMsg', handle(this.onGateMsg, this), this);
                callback && callback();
            }
        }.bind(this);
        LXLoginMessager.init(function () {
            this.addMessager(LXLoginMessager);
            done();
        }.bind(this));
        LXGameMessager.init(function () {
            this.addMessager(LXGameMessager);
            done();
        }.bind(this));
    },

    addMessager: function (Messager) {
        var messager = this.messagers[cc.js.getClassName(Messager)] = new Messager();
        messager.connector = this;
        return messager;
    },

    getMessager: function (Messager) {
        return this.messagers[cc.js.getClassName(Messager)];
    },

    onConnectError: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.disconnect(data);
    },

    onLoginSuccess: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        var accountInfo = this.accountInfo;
        var userInfo = data.userInfo;
        // if (accountInfo.channel == 1) {
        //     var key = 'FishJoy_tourist_' + accountInfo.account;
        //     var currTime = new Date().getTime();
        //     var cacheInfo = JSON.parse(localStorage.getItem(key));
        //     if (!cacheInfo || !cacheInfo.expireTime || cacheInfo.expireTime < currTime) {
        //         cacheInfo = {
        //             userInfo: userInfo,
        //             expireTime: currTime + 60 * 60 * 1000,
        //         };
        //         localStorage.setItem(key, JSON.stringify(cacheInfo));
        //     } else {
        //         userInfo = cacheInfo.userInfo;
        //     }
        // }
        this.userInfo = userInfo;
    },

    onLoginFailure: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.onConnectError(data);
    },

    onServerList: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.servers = data.servers || [];
    },

    onServerDetail: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        var server = data.server;
        if (!server) {
            var servers = this.servers;
            if (servers) {
                var connectCount = this.connectCount || 0;
                if (connectCount >= servers.length)
                    connectCount = 0;
                server = servers[connectCount];
                this.connectCount = connectCount + 1;
            }
        }
        if (!server) {
            this.onConnectError({msg: '找不到可连接的服务器'});
            return;
        }
        if (this.status != RECONNECTING) {
            this.status = CONNECTING;
            this.reconnectCount = 0;
            this.maxReconnectCount = 0;
        }
        var onOpen = function (evt) {
            this.send('loginServer', {userInfo: this.userInfo, accountInfo: this.accountInfo, sceneID: SCENE_IDS[0]});
            this.lastBeatTime = null;
            this.schedule(this.beat, 1)
        }.bind(this);
        var onClose = function (evt) {
            this.unschedule(this.beat);
            this.reconnect();
        }.bind(this);
        this.openSocket(server.url, onOpen, onClose);
    },

    switchScene: function (sceneID) {
        if (SCENE_IDS.indexOf(sceneID) < 0) {
            this.onConnectError({msg: '请求异常'});
            return;
        }
        if (sceneID != this.sceneID) {
            this.maxReconnectCount = 0;
            this.send('switchScene', {sceneID: sceneID});;
        } else {
            this.onLoginServerSuccess({sceneID: sceneID, isSwitching: true});
        }
    },

    onLoginServerSuccess: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if (this.status != CONNECTING && this.status != RECONNECTING)
            return;
        var sceneID = data.sceneID;
        if (SCENE_IDS.indexOf(sceneID) < 0) {
            this.onConnectError({msg: '请先退出其他游戏'});
            return;
        }
        this.status = CONNECTED;
        this.connectCount = 0;
        this.maxReconnectCount = 5;
        this.sceneID = sceneID;
        this.emit('connected');
    },

    onLoginServerFailure: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if (data.code == 16) {
            var arr = data.msg.split('_');
            var ip = LXUtil.int2ip(arr[0]);
            var port = arr[1];
            var server = {
                url: 'ws:' + ip + ':' + port,
            };
            this.onServerDetail({server: server});
            return;
        }
        this.onConnectError(data);
    },

    onReconnectServerSuccess: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.onLoginServerSuccess(data);
    },

    onReconnectServerFailure: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.onConnectError({msg: '登录服务器失败'});
    },

    onSysMsg: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        if (data.type > 0) 
            this.onConnectError({msg: data.msg});
    },

    onGateMsg: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.onConnectError({msg: data.msg});
    },

    onBeat: function (evt) {
        var data = evt instanceof cc.Event ? evt.detail : evt;
        this.lastBeatTime = new Date().getTime();
    },

    beat: function () {
        var currTime = new Date().getTime();
        var lastBeatTime = this.lastBeatTime || currTime;
        if (currTime - lastBeatTime > 5 * 1000) {
            this.interrupt();
            return;
        }
        this.send('beat');
    },

    getAccountInfo: function () {
        var url = LXUtil.getPageUrl();
        // url += '?lxt=f7d9f4720444f76csxrxqcgfsq&dd=0&cd=0&vs=2&_r=37526';
        var channel = parseInt(LXUtil.getSearchParamValue(url, 'channel'));
        if (isNaN(channel))
            channel = DEFAULT_CHANNEL;
        var account = '';
        var password = '';
        if (channel == 0) {
            account = LXUtil.getSearchParamValue(url, 'userencrypstring');
            password = LXUtil.getSearchParamValue(url, 'userencryptkey');
        }
        var accountInfo = {
            account: account,
            password: password,
            channel: channel,
        };
        return accountInfo;
    },

    connect: function () {
        if (this.status != WATING)
            return false;
        this.sceneID = 0;
        var accountInfo = this.getAccountInfo();
        this.status = DETECTING;
        var onOpen = function (evt) {
            this.accountInfo = accountInfo;
            this.send('login', {accountInfo: accountInfo});
        }.bind(this);
        var onClose = function (evt) {
            if (this.status == DETECTING)
                this.onConnectError({msg: '连接服务器失败'});
        }.bind(this);
        this.openSocket(LOGIN_URL, onOpen, onClose);
        return true;
    },

    reconnect: function () {
        if (this.status != CONNECTED && this.status != RECONNECTING)
            return;
        if (this.status != RECONNECTING) {
            this.status = RECONNECTING;
            this.reconnectCount = 0;
        }
        if (++this.reconnectCount > (this.maxReconnectCount || 0)) {
            this.onConnectError({msg: '与服务器连接中断'});
            return;
        }
        this.scheduleOnce(function () {
            this.emit('reconnecting', {count: this.reconnectCount, maxCount: this.maxReconnectCount});
            var server = {url: this.socket.url};
            this.onServerDetail({server: server});
        }.bind(this), 1)
    },

    disconnect: function (data) {
        if (this.status == DISCONNECTING || this.status == WATING) 
            return false;
        this.status = DISCONNECTING;
        this.closeSocket(function () {
            this.status = WATING;
            this.emit('disconnected', data);
        }.bind(this));
        return true;
    },

    interrupt: function (callback) {
        if (this.status != CONNECTED || this.socket.readyState != WebSocket.OPEN)
            return false;
        this.closeSocket(callback);
        return true;
    },

    openSocket: function (url, onOpen, onClose, onError) {
        this.closeSocket(function () {
            try {
                var socket = this.socket = new WebSocket(url);
                socket.binaryType = 'arraybuffer';
                socket.onopen = function(evt) {
                    // cc.log('socket onopen', evt);
                    onOpen && onOpen(evt);
                }.bind(this); 
                socket.onmessage = function(evt) {
                    this.recvMsg(evt.data);
                }.bind(this); 
                socket.onclose = function(evt) { 
                    // cc.log('socket onclose', evt);
                    onClose && onClose(evt);
                }.bind(this); 
                socket.onerror = function(evt) { 
                    // cc.log('socket onerror', evt);
                    onError && onError(evt);
                }.bind(this); 
            } catch (error) {
                this.onConnectError({msg: '请检查您的浏览器是否支持WebSocket'});
            }
        }.bind(this));
    },

    closeSocket: function (callback) {
        var socket = this.socket;
        if (socket && socket.readyState != WebSocket.CLOSED) {
            if (callback) {
                var onClose = typeof socket.onclose == 'function' ? socket.onclose : null;
                socket.onclose = function () {
                    onClose && onClose();
                    callback();
                };
            }
            socket.close();
        } else {
            callback && callback();
        }
    },

    sendMsg: function (mainCmd, subCmd, body) {
        var buffer = new ArrayBuffer(10 + (!!body ? body.byteLength : 0));
        var msgHead = new Uint8Array(buffer, 0, 2);//消息头部
        var msgCmd = new Uint16Array(buffer, 2, 4);// 消息命令部分
        var msgBody = new Uint8Array(buffer, 10);
        msgHead.set([6, 0]);
        msgCmd.set([buffer.byteLength, 0, mainCmd, subCmd]);
        if (msgBody.length > 0) {
            msgBody.set(new Uint8Array(body));
        }
        if (this.socket.readyState != WebSocket.OPEN) { 
            throw({message: '与服务器连接中断'});
        }
        // if (mainCmd != 0)
        //     cc.log('sendMsg', mainCmd, subCmd, body);
        this.socket.send(buffer);
    },

    recvMsg: function (buffer) {
        try {
            if (!buffer instanceof ArrayBuffer)
                return;
            var msgHead = new Uint8Array(buffer, 0, 2);//消息头部
            var msgCmd = new Uint16Array(buffer, 2, 4);// 消息命令部分
            var msgBody = new Uint8Array(buffer, 10);
            if (msgHead[0] != 6)
                throw({message: '包头错误'});
            else if(buffer.byteLength != msgCmd[0])
                throw({message: '包长错误'});

            var mainCmd = msgCmd[2];
            var subCmd = msgCmd[3]
            var body = new Uint8Array(msgBody).buffer;
            // if (mainCmd != 0)
            //     cc.log('recvMsg', mainCmd, subCmd, body);
            this.parseMsg(mainCmd, subCmd, body);
        } catch (error) {
            if (this.status != CONNECTED)
                this.onConnectError({msg: error.message});
            else 
        }
    },

    parseMsg: function (mainCmd, subCmd, body) {
        var messagers = this.messagers;
        for (var p in messagers) {
            if (!messagers.hasOwnProperty(p))
                continue;
            messagers[p].parseMsg(mainCmd, subCmd, body);
        }
    },

    send: function (type, data) {
        // cc.log('send', type, data);
        try {
            var messagers = this.messagers;
            for (var p in messagers) {
                if (!messagers.hasOwnProperty(p))
                    continue;
                messagers[p].send(type, data);
            }
        } catch (error) {
            if (this.status != CONNECTED && this.status != RECONNECTING) 
                this.onConnectError({msg: error.message});
        }
    },

    emit: function (message, detail) {
        // cc.log('emit', message, detail);
        this.node.emit(message, detail);
    },

    on: function (type, callback, target, useCapture) {
        this.node.on(type, callback, target, useCapture);
    },

    off: function (type, callback, target, useCapture) {
        this.node.off(type, callback, target, useCapture);
    },

    targetOff: function (target) {
        this.node.targetOff(target);
    },

    once: function (type, callback, target, useCapture) {
        this.node.once(type, callback, target, useCapture);
    },
});
