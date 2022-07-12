import {Factory} from './../utils/factory.js';
import {Anthill} from './Anthill.js';

export class App {
    constructor({ canvas, ctx }) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.factory = new Factory();
        this.anthill = this.factory.create(Anthill, { app: this });
    }
}