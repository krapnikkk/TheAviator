import * as fgui from "../../assets/libs/fairygui.min.js";
class UIPanel extends fgui.GComponent {
    constructor() {
        super();
    }

    onConstruct() {
        this.progress_level = this.getChild("progress_level");
        this.progress_energy = this.getChild("progress_energy").asCom;
        this.progress_level.max = 100;
        this.progress_energy.max = 100;
        this.text_distance = this.getChild("text_distance");
        this.text_level = this.getChild("text_level");
        this.energyCtrl = this.progress_energy.getController("color");
        this.ani_blinking = this.progress_energy.getTransition("blinking");
        this.ani_normal = this.progress_energy.getTransition("normal");
        this.animationStatus = false;
        this.text_play = this.getChild("text_play");
    }

    updateDistance(distance) {
        this.text_distance.text = distance + "";
    }

    updateLevel(step) {
        let value = this.progress_level.max * step;
        this.progress_level.value = value;
    }

    updateEnergy(value) {
        this.progress_energy.value = value;
        if (!this.animationStatus) {
            if (value < 30) {
                this.animationStatus = true;
                this.ani_blinking.play(() => {
                    this.animationStatus = false;
                })
            } else {
                this.ani_normal.play();
            }
        }


        if (value < 50) {
            this.energyCtrl.setSelectedIndex(1);
        } else {
            this.energyCtrl.setSelectedIndex(0);
        }
    }

    updateRound(value) {
        this.text_level.text = value + "";
    }

    showPlay(){
        this.text_play.visible = true;
    }

    hidePlay(){
        this.text_play.visible = false;
    }

}

export default UIPanel;