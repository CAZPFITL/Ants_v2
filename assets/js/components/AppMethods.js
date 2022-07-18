import Tools from "../engine/utils/Tools.js";
import Factory from "../engine/utils/Factory.js";
import Gui from "../engine/inits/Gui.js";
import Physics from "../engine/utils/Physics.js";
import Camera from "../engine/inits/Camera.js";
import Controls from "../engine/inits/Controls.js";
import Player from "../engine/inits/Player.js";

export default class AppMethods {
    show() {
        this.showSensors = !this.showSensors;
    }

    loadVariables() {
        this.showSensors = true;
        this.entities = [];
    }

    loadEngine(app) {
        this.loadVariables();
        this.gui = new Gui(this);
        this.tools = new Tools(this);
        this.physics = new Physics(this);
        this.factory = new Factory(this);
        this.camera = new Camera(this);
        this.player = new Player(this);
        this.controls = new Controls(this);
        this.loadInits(app);
    }

    loadInits(app) {
        for (let i = 0; i < app.inits.length; i++) {
            (typeof app.inits[i] === 'function') && app.inits[i]();
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
                this.factory.binnacle[key][i].draw(this.gui.ctx);
            }
        }
    }
}