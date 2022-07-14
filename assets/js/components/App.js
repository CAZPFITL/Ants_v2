import {Factory} from './Factory.js';
import {Anthill} from './Anthill.js';
import {Camera} from './Camera.js';

export class App {
    constructor() {
        this.factory = new Factory();
        this.anthill = this.factory.create(Anthill, {app: this});
        this.#init();
    }

    // App initialization
    #init() {
        this.canvas = document.getElementById('gameCanvas');
        // set the canvas with to the width of the window
        this.canvas.width = window.innerWidth;
        // add canvas id to the canvas
        this.canvas.id = 'gameCanvas';
        // add the canvas to the body
        this.ctx = this.canvas.getContext('2d');
        // create camera
        this.camera = new Camera(this.ctx)
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