import Factory from './Factory.js';
import Anthill from './Anthill.js';
import Camera from './Camera.js';
import Controls from "./Controls.js";
import Gui from "./Gui.js";
import Physics from "./Physics.js";

export default class App {
    constructor(onWindow) {
        this.factory = new Factory();
        this.anthill = this.factory.create(Anthill, {app: this});
        this.#init(onWindow);
    }

    // App initialization
    #init(onWindow) {
        this.canvas = document.getElementById('gameCanvas');
        // set the canvas with to the width of the window
        this.canvas.width = window.innerWidth;
        // add canvas id to the canvas
        this.canvas.id = 'gameCanvas';
        // add the canvas to the body
        this.ctx = this.canvas.getContext('2d');
        // create camera
        this.camera = new Camera(this)
        // create the controls
        this.controls = new Controls(this);
        // create gui
        this.gui = new Gui(this);
        // create physics
        this.physics = new Physics(this);
        // create the cheat mode
        (onWindow) && (window.app = this);
        // create the request animation frame
        this.request = requestAnimationFrame(this.#animate);
    }

    // draw the entities
    #animate = () => {
        // begin camera
        this.camera.begin();

        // update the entities
        this.updateEntities();

        // draw
        this.drawEntities();

        // end camera: restore and request
        this.camera.end(this.#animate);
    }

    // update entities
    updateEntities() {
        // loop this.factory.binnacle to update all the entities
        for (let key in this.factory.binnacle) {
            for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                (Boolean(this.factory.binnacle[key][i].update)) &&
                    this.factory.binnacle[key][i].update();
            }
        }
    }

    // draw all entities
    drawEntities() {
        for (let key in this.factory.binnacle) {
            for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                (Boolean(this.factory.binnacle[key][i].draw)) &&
                    this.factory.binnacle[key][i].draw(this.ctx);
            }
        }
    }
}