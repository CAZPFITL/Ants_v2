import AppGui from '../../../../engine/utils/gui/Gui.js';
import Ants2 from './Screen.js';
import Ants2Trainer from "./../../../ants2_trainer/utils/gui/Screen.js";

export default class Gui {
    constructor(app, game) {
        this.app = app
        this.no_update = false;
        this.no_draw = false;
        this.controlsCtx = AppGui.createCanvas('controlsCanvas');
        this.screens = {
            Ants2: Ants2,
            Ants2Trainer: Ants2Trainer
        }
        this.screen = new this.screens[game.constructor.name](this.app, this);
    }

    hoverStateIn() {
        if (this.controlsCtx.canvas.style.cursor !== 'pointer') {
            this.controlsCtx.canvas.style.cursor = 'pointer';
        }
    }

    hoverStateOut() {
        if (this.controlsCtx.canvas.style.cursor === 'pointer') {
            this.controlsCtx.canvas.style.cursor = 'default';
        }
    }

    /**
     * Draw and Update methods
     */
    update() {
        if (!this.no_update) {
            this.screen.update();
            this.controlsCtx.canvas.height = window.innerHeight;
            this.controlsCtx.canvas.width = window.innerWidth;
            this.controlsCtx.save();
        }
    }

    draw() {
        if (!this.no_draw) {
            this.screen.draw();
            this.controlsCtx.restore();
        }
    }
}