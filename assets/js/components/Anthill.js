
import Ant from './Ant.js';
export default class Anthill {
    constructor({app, id = 0, width, height, ants = 100}) {
        this.name = 'Anthill';
        this.population = [];
        this.app = app;
        this.ants = ants;
        this.#createAnt();
    }

    #id() {
        return this.population.length + 1;
    }

    #createAnt() {
        // create a x length array of zeros
        const x = Array(this.ants).fill(0);
        console.log(x.length);
        x.forEach((a) => {
            this.population.push(this.app.factory.create(
                Ant,
                {
                    id: this.#id(),
                    app: this.app,
                    x: this.app.tools.random(-window.innerWidth * 0.25,window.innerWidth * 0.25, true),
                    y: this.app.tools.random(-window.innerHeight * 0.25,window.innerHeight * 0.25, true),
                    angle: this.app.tools.random(-3.6,3.6, false),
                }
            ))
        });
    }
}
