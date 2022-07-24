import AppGui from '../../../engine/utils/gui/Gui.js';
import Screen from './Screen.js';

export default class Gui {
    constructor(app, game) {
        this.app = app
        this.no_update = false;
        this.no_draw = false;
        this.controlsCtx = AppGui.createCanvas('controlsCanvas');
        this.screen = new Screen(app, this);
    }

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