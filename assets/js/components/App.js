import {Factory} from './../utils/factory.js';
import {Anthill} from './Anthill.js';

export class App {
    constructor({canvas, ctx}) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.factory = new Factory();
        this.anthill = this.factory.create(Anthill, {app: this});
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

    // save game ctx
    saveCtx() {
        this.canvas.height = window.innerHeight;
        this.ctx.save();
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

    // restore gameCTX
    restore(animate) {
        this.ctx.restore();
        this.request = requestAnimationFrame(animate);
    }
}