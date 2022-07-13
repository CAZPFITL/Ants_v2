import {Ant} from './Ant.js';

export class Anthill {
    constructor(props) {
        this.name = 'Anthill';
        this.population = [];
        this.app = props.app;

        this.#createAnt();
    }

    #createAnt() {
        this.population.push(this.app.factory.create(Ant, {}));
        // this.population.push(this.app.factory.create(Ant, {}));
        // this.population.push(this.app.factory.create(Ant, {}));
    }
}