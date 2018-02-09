var ProtoBuf = require('protobuf');
var LXUtil = require('LXUtil');

var MSG_CMD = {
    MDM_MB_LOGON: 100,//登录登录服务器
    SUB_MB_LOGON_ACCOUNTS: 1,//登录登录服务器
    SUB_MB_LOGON_FAILURE: 501,//登录失败
    SUB_MB_LOGON_SUCCESS: 500,//登录成功

    MDM_MB_SERVER_LIST: 101,//房间
    SUB_MB_LIST_SERVER: 101,//房间列表
    SUB_MB_LIST_FINISH: 200,//房间列表完成

    MDM_CM_SYSTEM: 200,
    SUB_CM_SYSTEM_MESSAGE: 1,

    MDM_GR_LOGON: 1,//登陆网关服务器
    SUB_GR_LOGON_USERID: 1,//登陆网关服务器
    SUB_GR_LOGON_FAILURE: 101,//登陆失败
    
    MDM_CS_MAIN_LOGIC: 1000,//登陆成功
    SUB_S_USER_LOGIN_SUCC: 3001,//登陆成功
    SUB_S_USER_LOGIN_FAIED: 3002,//登陆失败
    SUB_S_USER_RECONNECT_SUCC: 3004,//重连成功
    SUB_U_SWITCH_SECNE: 1,//场景切换
    SUB_S_USER_SWITCH_SUCC: 3009,//场景切换成功
    SUB_S_USER_SWITCH_FAILED: 3010,//场景切换失败
    SUB_S_SYSTEM_MESSAGE: 3011,//系统维护
    SUB_U_QUIT_GAME: 2,//用户退出游戏
    SUB_S_USER_QUIT_GAME: 3012,//游戏退出结果
};

var MSG_PB = {

};

var Class = cc.Class({
    name: "LXLoginMessager",

    statics: {
        initialized: false,

        init: function (callback) {
            if (this.initialized) {
                callback && callback();
            };
            var total = 2;
            var done = function () {
                if (--total <=  0) {
                    this.initialized = true;
                    callback && callback();
                }
            }.bind(this);
            cc.loader.loadRes('pb/ServerStruct_Logon', function (err, res){
                var builder = ProtoBuf.protoFromString(res);
                MSG_PB.PB_MB_Logon = builder.build('PB_MB_Logon');
                MSG_PB.PB_MB_LogonFailure = builder.build('PB_MB_LogonFailure');
                MSG_PB.PB_MB_LogonSuccess = builder.build('PB_MB_LogonSuccess');
                MSG_PB.PB_MB_ServerInfo = builder.build('PB_MB_ServerInfo');
                MSG_PB.PB_MB_GameServerList = builder.build('PB_MB_GameServerList');
                MSG_PB.PB_MB_RoomListFinish = builder.build('PB_MB_RoomListFinish');
                done();
            }.bind(this));
            cc.loader.loadRes('pb/ServerStruct_Game', function (err, res){
                var builder = ProtoBuf.protoFromString(res);
                MSG_PB.MMO_GT_SystemMessage = builder.build('MMO_GT_SystemMessage');
                MSG_PB.MMO_GT_Logon = builder.build('MMO_GT_Logon');
                MSG_PB.MMO_SN_LoginSucc = builder.build('MMO_SN_LoginSucc');
                MSG_PB.MMO_GT_LogonFailed = builder.build('MMO_GT_LogonFailed');
                MSG_PB.MMO_SN_ReconnectSucc = builder.build('MMO_SN_ReconnectSucc');
                MSG_PB.MMO_SN_ReconnectFail = builder.build('MMO_SN_ReconnectFail');
                MSG_PB.MMO_U_SwitchScene = builder.build('MMO_U_SwitchScene');
                MSG_PB.MMO_GT_GameSystemMessage = builder.build('MMO_GT_GameSystemMessage');
                MSG_PB.MMO_SN_SystemMessage = builder.build('MMO_SN_SystemMessage');
                MSG_PB.MMO_SN_QuitGameResult = builder.build('MMO_SN_QuitGameResult');
                done();
            }.bind(this));
        },
    },

    ctor: function () {
        this.connector = null;
    },

    parseMsg: function (mainCmd, subCmd, body) {
        switch (mainCmd) {
            case MSG_CMD.MDM_MB_LOGON: 
                this.parseLogonMsg(subCmd, body);
                break;
            case MSG_CMD.MDM_MB_SERVER_LIST: 
                this.parseServerMsg(subCmd, body);
                break;
            case MSG_CMD.MDM_CM_SYSTEM: 
                this.parseGateSysMsg(subCmd, body);
                break;
            case MSG_CMD.MDM_GR_LOGON: 
                this.parseGateLogonMsg(subCmd, body);
                break;
            case MSG_CMD.MDM_CS_MAIN_LOGIC : 
                this.parseMainMsg(subCmd, body);
                break;
            case 0: 
                if (subCmd == 1)
                    this.connector.emit('beat');
                break;
            default: break;
        }
    },

    parseLogonMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.SUB_MB_LOGON_SUCCESS: 
                var pbData = MSG_PB.PB_MB_LogonSuccess.decode(body);
                var userInfo = {
                    id: pbData.get('dwUserID') != null ? pbData.get('dwUserID').toNumber() : null,
                    password: pbData.get('szValidCode'),
                };
                this.emit('loginSuccess', {userInfo: userInfo});
                break;
            case MSG_CMD.SUB_MB_LOGON_FAILURE: 
                var pbData = MSG_PB.PB_MB_LogonFailure.decode(body);
                var code = pbData.get('lResultCode');
                var msg = pbData.get('szDescribeString');
                this.emit('loginFailure', {code: code, msg: msg});
                break;
            default: break;
        }
    },

    parseServerMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.SUB_MB_LIST_SERVER: 
                var pbData = MSG_PB.PB_MB_GameServerList.decode(body);
                var servers  = [];
                var pbServers = pbData.get('serverInfo') || [];
                for (var i = 0, len = pbServers.length; i < len; i++) {
                    var pbServer = pbServers[i];
                    var ip = LXUtil.int2ip(pbServer.get('wServerIP'));
                    var port = pbServer.get('wServerPort');
                    var server = {
                        url: 'ws://' + ip + ':' + port,
                    };
                    servers.push(server);
                }
                this.emit('serverList', {servers: servers});
                break;
            case MSG_CMD.SUB_MB_LIST_FINISH: 
                var pbData = MSG_PB.PB_MB_RoomListFinish.decode(body);
                var server = null;
                if (pbData.get('wReconnectServerId') > 0) {
                    var ip = LXUtil.int2ip(pbData.get('wReconnectServerIP'));
                    var port = pbData.get('dwReconnectServerPort') != null ? pbData.get('dwReconnectServerPort').toNumber() : null;
                    server = {
                        url: 'ws://' + ip + ':' + port,
                    };
                }
                var sceneID = pbData.get('wSceneID');
                this.emit('serverDetail', {server: server, sceneID: sceneID});
                break;
            default: break;
        }
    },

    parseGateSysMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.SUB_CM_SYSTEM_MESSAGE: 
                var pbData = MSG_PB.MMO_GT_SystemMessage.decode(body);
                var code = pbData.get('wType');
                var msg = pbData.get('szString');
                this.emit('gateMsg', {code: code, msg: msg});
                break;
            default: break;
        }
    },

    parseGateLogonMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.SUB_GR_LOGON_FAILURE: 
                var pbData = MSG_PB.MMO_GT_LogonFailed.decode(body);
                var code = pbData.get('lErrorCode');
                var msg = pbData.get('szDescribeString');
                this.emit('loginServerFailure', {code: code, msg: msg});
                break;
            default: break;
        }
    },

    parseMainMsg: function (subCmd, body) {
        switch (subCmd) {
            case MSG_CMD.SUB_S_USER_LOGIN_SUCC: 
            case MSG_CMD.SUB_S_USER_SWITCH_SUCC: 
                var pbData = MSG_PB.MMO_SN_LoginSucc.decode(body);
                var sceneID = pbData.get('nCurSceneID');
                var version = pbData.get('wVersion');
                var isSwitching = (subCmd == MSG_CMD.SUB_S_USER_SWITCH_SUCC);
                this.emit('loginServerSuccess', {sceneID: sceneID, version: version, isSwitching: isSwitching});
                break;
            case MSG_CMD.SUB_S_USER_LOGIN_FAIED: 
            case MSG_CMD.SUB_S_USER_SWITCH_FAILED: 
                var pbData = MSG_PB.MMO_GT_LogonFailed.decode(body);
                var code = pbData.get('lErrorCode');
                var msg = pbData.get('szDescribeString');
                this.emit('loginServerFailure', {msg: msg});
                break;
            case MSG_CMD.SUB_S_USER_RECONNECT_SUCC: 
                var pbData = MSG_PB.MMO_SN_ReconnectSucc.decode(body);
                var sceneID = pbData.get('nCurSceneID');
                var version = pbData.get('wVersion');
                this.emit('reconnectServerSuccess', {sceneID: sceneID, version: version});
                break;
            case MSG_CMD.SUB_S_USER_RECONNECT_FAIL: 
                var pbData = MSG_PB.MMO_SN_ReconnectFail.decode(body);
                this.emit('reconnectServerFailure');
                break;
            case MSG_CMD.SUB_S_SYSTEM_MESSAGE:
                var pbData = MSG_PB.MMO_SN_SystemMessage.decode(body);
                var type = pbData.get('wType');
                var msg = pbData.get('szString');
                this.emit('sysMsg', {type: type, msg: msg});
                break;
            case MSG_CMD.SUB_S_USER_QUIT_GAME:
                var pbData = MSG_PB.MMO_SN_QuitGameResult.decode(body);
                var type = pbData.get('wType');
                this.emit('quit', {type: type});
                break;
            default: break;
        }
    },

    send: function (type, data) {
        var connector = this.connector;
        switch (type) {
            case 'login': 
                var accountInfo = data.accountInfo;
                var pbData = new MSG_PB.PB_MB_Logon();
                pbData.set('szAccount', accountInfo.account);
                pbData.set('szPassword', accountInfo.password);
                pbData.set('wChannel', accountInfo.channel);
                connector.sendMsg(MSG_CMD.MDM_MB_LOGON, MSG_CMD.SUB_MB_LOGON_ACCOUNTS, pbData.encode().toArrayBuffer());
                break;
            case 'loginServer':
                var accountInfo = data.accountInfo;
                var userInfo = data.userInfo;
                var pbData = new MSG_PB.MMO_GT_Logon();
                pbData.set('szAccount', accountInfo.account);
                pbData.set('szPassword', accountInfo.password);
                pbData.set('wChannel', accountInfo.channel);
                pbData.set('dwUserID', userInfo.id);
                pbData.set('wSceneID', data.sceneID);
                connector.sendMsg(MSG_CMD.MDM_GR_LOGON, MSG_CMD.SUB_GR_LOGON_USERID, pbData.encode().toArrayBuffer());
                break;
            case 'switchScene': 
                var pbData = new MSG_PB.MMO_U_SwitchScene();
                pbData.set('wSceneID', data.sceneID);
                connector.sendMsg(MSG_CMD.MDM_CS_MAIN_LOGIC, MSG_CMD.SUB_U_SWITCH_SECNE, pbData.encode().toArrayBuffer());
                break;
            case 'beat':
                connector.sendMsg(0, 1);
        }
    },

    emit: function (message, detail) {
        this.connector.emit(message, detail);
    },
});

module.exports = Class;