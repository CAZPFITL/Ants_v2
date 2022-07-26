import {GAME_OVER, PLAY} from "../../env.js";

export default class Food {
    constructor({app, bounds}) {
        this.app = app;
        this.no_update = false;
        this.no_draw = false;
        this.#getFoodData(bounds);
    }
    /**
     * Private methods
     */
    #getFoodData({width, height}) {
        const size = this.app.tools.random(50, 100);
        this.polygons = [];
        this.width = this.app.tools.random(50, 100);
        this.height = this.app.tools.random(50, 100);
        this.initialSize = size;
        this.amount = size;
        this.minSize = 30;
        // TODO Make a better random initial place generator (avoid appear near the anthill)
        this.x = this.app.tools.random(-(width - size), (width - size));
        this.y = this.app.tools.random(-(height - size), (height - size));
        this.angle = this.app.tools.random(0, 3.6);
        this.color = '#33211c';
    }

    /**
     * Draw and Update methods
     */
    shape() {
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        return [
            {
                x: this.x - Math.sin(this.angle - 1.5) * rad,
                y: this.y - Math.cos(this.angle - 1.5) * rad
            },
            {
                x: this.x - Math.sin(this.angle - alpha) * rad,
                y: this.y - Math.cos(this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(this.angle) * rad,
                y: this.y - Math.cos(this.angle) * rad
            },
            {
                x: this.x - Math.sin(this.angle + alpha) * rad,
                y: this.y - Math.cos(this.angle + alpha) * rad
            },
            {
                x: this.x - Math.sin(this.angle + 1.5) * rad,
                y: this.y - Math.cos(this.angle + 1.5) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - 1.5) * rad,
                y: this.y - Math.cos(Math.PI + this.angle - 1.5) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle) * rad,
                y: this.y - Math.cos(Math.PI + this.angle) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + 1.5) * rad,
                y: this.y - Math.cos(Math.PI + this.angle + 1.5) * rad
            },
        ]
    }

    update() {
        if (!this.no_update &&
                this.app.game.state.state === PLAY ||
                    this.app.game.state.state === GAME_OVER) {
            (this.amount >= this.minSize) && (this.width = this.amount);
            (this.amount >= this.minSize) && (this.height = this.amount);
            (this.amount <= 0) && (this.app.factory.binnacle.Food = this.app.factory.binnacle.Food.filter(food => food !== this));
            this.app.gui.get.createPolygon(this);
        }
    }

    draw() {
        if (!this.no_draw &&
                this.app.game.state.state === PLAY ||
                    this.app.game.state.state === GAME_OVER) {
            this.app.gui.get.drawPolygon(this.app.gui.ctx, this);
            (this.amount < this.initialSize) && this.app.gui.get.bar({
                ctx: this.app.gui.ctx,
                x: this.x - this.initialSize / 2,
                y: this.y - this.height * 1.3,
                fillColor: 'red-green',
                barColor: 'rgba(0,0,0,0.5)',
                cap: this.initialSize,
                fill: this.amount,
            }, false);
        }
    }
}