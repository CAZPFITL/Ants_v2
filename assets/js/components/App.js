import Factory from '../utils/Factory.js';
import Camera from '../inits/Camera.js';
import Controls from "../inits/Controls.js";
import Gui from "../utils/Gui.js";
import Physics from "../utils/Physics.js";
import Tools from "../utils/Tools.js";
import Anthill from './Anthill.js';
import Level from "./Level.js";

export default class App {
    constructor(onWindow) {
        this.loadGame(onWindow);
    }

    loadGame(onWindow) {
        /*
         * INITIALIZE VARIABLES
         */
        this.showSensors = true;
        this.entities = [];
        // in this array will be pushed all the inits classes and all the factory entities to be used in the game
        this.inits = [
            () => this.level = this.factory.create(Level, {app: this, width: 400, height: 400}),
            () => this.anthill = this.factory.create(Anthill, {app: this, ants: 140}),
        ];
        /*
         * LOAD GAME CLASSES
         */
        this.tools = new Tools(this);
        this.factory = new Factory(this);
        this.camera = new Camera(this)
        this.controls = new Controls(this);
        this.gui = new Gui(this);
        this.physics = new Physics(this);
        /*
         * LOAD CANVAS
         */
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = window.innerWidth;
        this.canvas.id = 'gameCanvas';
        this.ctx = this.canvas.getContext('2d');
        /*
         * LOAD GAME CLASSES & ENTITIES
         */
        for (let i = 0; i < this.inits.length; i++) {
            this.inits[i]();
        }
        (onWindow) && (window.app = this);
        this.request = requestAnimationFrame(this.#animate);
    }

    show() {
        this.showSensors = !this.showSensors;
    }

    #animate = () => {
        this.camera.begin();
        this.updateEntities();
        this.drawEntities();
        this.camera.end(this.#animate);
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