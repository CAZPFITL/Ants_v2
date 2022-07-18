
import Ant from './Ant.js';

export default class Anthill {
    constructor({app, id = 0, width, height, ants = 100}) {
        this.app = app;
        this.getAnthillData({ants});
    }

    getAnthillData({ants}) {
        this.name = 'Anthill';
        this.population = [];
        this.ants = ants;
        this.food = 0;
        this.#createAnt();
    }

    #id() {
        return this.population.length + 1;
    }

    update() {
        this.population = [...this.app.factory.binnacle.Ant]
        this.ants = this.population.length;
        if (this.population.length === 0) {
            this.app.gameOver = true;
        }
    }

    #createAnt() {
        const x = Array(this.ants).fill(0);

        x.forEach(() => {
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
