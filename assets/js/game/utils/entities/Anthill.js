import Ant from './Ant.js';

export default class Anthill {
    constructor({app, id = 0, ants = 1 }) {
        const width = app.tools.random(50,150)
        const height = app.tools.random(50,150)
        this.no_update = false;
        this.no_draw = false;

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
        this.app.player.anthill = this;
        this.fillPopulation();
    }

    /**
     * Private
     */
    #id() {
        return this.population.length + 1;
    }

    #createAnt(ants) {
        const x = Array(1).fill(0);

        x.forEach(() => {
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
            this.app.player.updateAnt(this.population[this.population.length - 1]);
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
        this.#createAnt(this.ants);
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
        if (!this.no_update) {
            this.population = [...this.app.factory.binnacle.Ant]
            this.ants = this.population.length;
            // TODO: delegate this to the state management and move it to the main file, in there the rules can be defined as conditions
            (this.ants === 0) && this.app.game.state.setState('GAME_OVER');
            this.app.gui.createPolygon(this);
        }
    }

    draw() {
        if (!this.no_draw) {
            this.app.gui.drawPolygon(this.app.gui.ctx, this);
        }
    }
}
