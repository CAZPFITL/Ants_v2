import Tools from "./Tools.js";
import State from "../State.js";
import Factory from "../Factory.js";
import Gui from "../gui/Gui.js";
import Physics from "../Physics.js";
import Camera from "../gui/Camera.js";
import Controls from "../../inits/Controls.js";
import Player from "../../inits/Player.js";
import GameLevel from "../../inits/GameLevel.js";

export default class AppMethods {
    show() {
        this.showSensors = !this.showSensors;
    }

    loadVariables() {
        this.showSensors = true;
        // Change this for states
        this.gameOver = false;
        this.entities = [];
        this.inits = [
            () => this.factory.addGameEntity(this.gui),
            () => this.level = this.factory.create(GameLevel, {
                app: this,
                width: 2000,
                height: 1200
            })
        ];
    }

    loadEngine(app, Game) {
        this.loadVariables();
        this.state = new State(this);
        this.tools = new Tools(this);
        this.factory = new Factory(this);
        this.physics = new Physics(this);

        this.gui = new Gui(this);
        this.camera = new Camera(this);
        this.player = new Player(this);
        this.controls = new Controls(this);

        this.loadInits(app);
        this.game = new Game(this);
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

    animate = () => {
        this.camera.begin();
        this.updateEntities();
        this.drawEntities();
        this.camera.end(this.animate);
    }
}