cc.Class({
    extends: cc.Component,

    properties: {
        map: cc.TiledMap,
        sheep: cc.Node,
        chess: dragonBones.ArmatureDisplay,
    },

    onLoad: function () {
        let url = 'tilemap/tile_iso_offset';

        cc.loader.loadRes(url, cc.TiledMapAsset, function(err, tmxAsset) {
            if (err) {
                cc.error(err);
                return;
            }
            if (this.map) {
                this.map.tmxAsset = tmxAsset;
            }
        }.bind(this));

        window.kk = this;

        util.log('game.js');
    },
});
