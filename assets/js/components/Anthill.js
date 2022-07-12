import {Ant} from './Ant.js';

export class Anthill {
    constructor(props) {
        this.name = 'Anthill';
        this.queen = null
        this.population = [];
        this.food = 0;
        this.app = props.app;
        this.#createAnt();
    }

    #createAnt() {
        this.population.push(this.app.factory.create(Ant, {app: this.app}));
    }
}