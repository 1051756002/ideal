cc.Class({
    extends: cc.Component,

    properties: {
        map: cc.TiledMap,
        sheep: cc.Node,
    },

    onLoad: function () {
        let url = 'tilemap/tile_iso_offset';

        cc.loader.loadRes(url, cc.TiledMapAsset, function(err, tmxAsset) {
            if (err) {
                cc.error(err);
                return;
            }
            this.map.tmxAsset = tmxAsset;
        }.bind(this));

        window.kk = this;
    },
});
