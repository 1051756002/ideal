cc.Class({
    extends: cc.Component,

    properties: {
        spine: sp.Skeleton,
        bone: dragonBones.ArmatureDisplay,
        lblAni: cc.Label,
        map: cc.TiledMap,
    },

    onLoad: function () {
        window.kk = this;
        this.spine_idx = 0;
        this.spine_list = [];
        for (let i in this.spine.skeletonData.skeletonJson.animations) {
            this.spine_list.push(i);
        }
        this.lblAni.string = this.spine.animation;


        this.bone_idx = 0;
        this.bone_list = [];
        for (let i = 1; i <= 3; i++) {
            for (let j = 1; j <= 6; j++) {
                this.bone_list.push(j + '-' + i);
            }
        }
        for (let i = 2; i <= 3; i++) {
            for (let j = 1; j <= 6; j++) {
            this.bone_list.push(j + '-' + i + '_x');
            }
        }
        // this.bone_list = [
        //     "idle_zheng_1",
        //     "happy_zheng_1",
        //     "idle_zheng_2",
        //     "happy_zheng_2",
        //     "happy_zheng_3",
        //     "idle_zheng_3",
        //     "sleep_zheng_1",
        //     "happy_bei_1",
        //     "happy_bei_2",
        //     "happy_bei_3",
        //     "idle_bei_1",
        //     "idle_bei_2",
        //     "idle_bei_3",
        //     "attacked_bei_1",
        //     "attacked_bei_2",
        //     "attacked_bei_3","attacked_zheng_1","attacked_zheng_2","attacked_zheng_3","sleep_zheng_2","sleep_zheng_3","sleep_bei_1","sleep_bei_2","sleep_bei_3"];
    },

    onToggleAni: function() {
        if (this.spine_idx >= this.spine_list.length - 1) {
            this.spine_idx = 0;
        } else {
            this.spine_idx++;
        }
        let name = this.spine_list[this.spine_idx];
        this.spine.animation = name;
        this.lblAni.string = name;
    },

    onToggleBone: function() {
        if (this.bone_idx >= this.bone_list.length - 1) {
            this.bone_idx = 0;
        } else {
            this.bone_idx++;
        }
        let name = this.bone_list[this.bone_idx];
        this.bone.playAnimation(name);
        this.lblAni.string = name;
    },
});
