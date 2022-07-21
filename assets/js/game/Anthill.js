import Ant from './Ant.js';

export default class Anthill {
    constructor({app, id = 0, ants = 1 }) {
        const width = app.tools.random(50,150)
        const height = app.tools.random(50,150)

        this.app = app;
        this.name = 'Anthill';
        this.population = [];
        this.polygons = [];
        this.ants = ants;
        this.size = { width, height }
        this.coords = { x: 0 / 2, y: 0 };
        this.angle = 0;
        this.food = 50;
        this.color = '#381801';
        this.antCoste = 10;
    }

    /**
     * Private
     */
    #id() {
        return this.population.length + 1;
    }

    #createAnt() {
        const x = Array(this.ants).fill(0);

        x.forEach(() => {
            this.addAnt();
        });
    }

    addAnt() {
        if (this.food >= this.antCoste) {
            this.population.push(this.app.factory.create(
                Ant,
                {
                    id: this.#id(),
                    app: this.app,
                    x: 0,
                    y: 0,
                    angle: this.app.tools.random(-3.6, 3.6, false),
                    anthill: this
                }
            ))
            this.food -= this.antCoste;
        }
    }

    removeAnt(ant) {
        const cleared = this.population.filter(ant => ant !== ant);
        this.population = cleared;
        this.app.factory.binnacle.Ant = cleared;
    }

    fillPopulation() {
        this.#createAnt();
    }
    /**
     * In game draw section
     */
    shape() {
        const rad = Math.hypot(this.size.width, this.size.height) / 2;
        const alpha = Math.atan2(this.size.width, this.size.height);
        return [
            {
                x: this.coords.x - Math.sin(this.angle - 1.5) * rad,
                y: this.coords.y - Math.cos(this.angle - 1.5) * rad
            },
            {
                x: this.coords.x - Math.sin(this.angle - alpha) * rad,
                y: this.coords.y - Math.cos(this.angle - alpha) * rad
            },
            {
                x: this.coords.x - Math.sin(this.angle) * rad,
                y: this.coords.y - Math.cos(this.angle) * rad
            },
            {
                x: this.coords.x - Math.sin(this.angle + alpha) * rad,
                y: this.coords.y - Math.cos(this.angle + alpha) * rad
            },
            {
                x: this.coords.x - Math.sin(this.angle + 1.5) * rad,
                y: this.coords.y - Math.cos(this.angle + 1.5) * rad
            },
            {
                x: this.coords.x - Math.sin(Math.PI + this.angle - 1.5) * rad,
                y: this.coords.y - Math.cos(Math.PI + this.angle - 1.5) * rad
            },
            {
                x: this.coords.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.coords.y - Math.cos(Math.PI + this.angle - alpha) * rad
            },
            {
                x: this.coords.x - Math.sin(Math.PI + this.angle) * rad,
                y: this.coords.y - Math.cos(Math.PI + this.angle) * rad
            },
            {
                x: this.coords.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.coords.y - Math.cos(Math.PI + this.angle + alpha) * rad
            },
            {
                x: this.coords.x - Math.sin(Math.PI + this.angle + 1.5) * rad,
                y: this.coords.y - Math.cos(Math.PI + this.angle + 1.5) * rad
            },
        ]
    }

    update() {
        this.population = [...this.app.factory.binnacle.Ant]
        this.ants = this.population.length;
        if (this.population.length === 0) {
            this.app.gameOver = true;
        }
        this.app.gui.createPolygon(this);
    }

    draw() {
        this.app.gui.drawPolygon(this.app.gui.ctx, this);
    }
}
