import Ant from './Ant.js';

export default class Anthill {
    constructor({app, id = 0, ants = 100, width = 60, height = 30}) {
        this.app = app;
        this.getAnthillData({ants, width, height});
    }

    getAnthillData({ants, width, height}) {
        this.name = 'Anthill';
        this.population = [];
        this.ants = ants;
        this.coords = { x: -width / 2, y: -height / 2 };
        this.size = { width, height}
        this.food = 0;
        this.color = '#360904';
        this.#createAnt();
    }

    #id() {
        return this.population.length + 1;
    }
    #createAnt() {
        const x = Array(this.ants).fill(0);

        x.forEach(() => {
            this.population.push(this.app.factory.create(
                Ant,
                {
                    id: this.#id(),
                    app: this.app,
                    x: this.app.tools.random(-100,100, false),
                    y: this.app.tools.random(-100,100, false),
                    angle: this.app.tools.random(-3.6,3.6, false),
                }
            ))
        });
    }

    update() {
        this.population = [...this.app.factory.binnacle.Ant]
        this.ants = this.population.length;
        if (this.population.length === 0) {
            this.app.gameOver = true;
        }
    }

    draw() {
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
    }
}
