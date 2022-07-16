import Tools from "../utils/Tools.js";
import Factory from "../utils/Factory.js";
import Camera from "../inits/Camera.js";
import Controls from "../inits/Controls.js";
import Gui from "../utils/Gui.js";
import Physics from "../utils/Physics.js";

export default class AppMethods {
    show() {
        this.showSensors = !this.showSensors;
    }

    loadVariables() {
        this.showSensors = true;
        this.entities = [];
    }

    loadCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = window.innerWidth;
        this.canvas.id = 'gameCanvas';
        this.ctx = this.canvas.getContext('2d');
    }

    loadGameClasses() {
        this.tools = new Tools(this);
        this.factory = new Factory(this);
        this.camera = new Camera(this)
        this.controls = new Controls(this);
        this.gui = new Gui(this);
        this.physics = new Physics(this);
    }

    loadInits(app) {
        for (let i = 0; i < app.inits.length; i++) {
            app.inits[i]();
        }
        app.request = requestAnimationFrame(app.animate);
    }

    updateEntities() {
        for (let key in this.factory.binnacle) {
            for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                (Boolean(this.factory.binnacle[key][i].update)) &&
                this.factory.binnacle[key][i].update();
            }
        }
    }

    drawEntities() {
        for (let key in this.factory.binnacle) {
            for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                (Boolean(this.factory.binnacle[key][i].draw)) &&
                this.factory.binnacle[key][i].draw(this.ctx);
            }
        }
    }
}