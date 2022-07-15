import Ant from './Ant.js';

export default class Anthill {
    constructor(props) {
        this.name = 'Anthill';
        this.population = [];
        this.app = props.app;
        this.#createAnt();
    }

    #id() {
        return this.population.length + 1;
    }

    #createAnt() {
        [0,1,2].forEach((a) => {
            this.population.push(this.app.factory.create(
                Ant,
                {
                    id: this.#id(),
                    app: this.app,
                    x: 0,
                    y: 0
                }
            ))
        });
    }
}