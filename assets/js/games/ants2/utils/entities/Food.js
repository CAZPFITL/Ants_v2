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
        const size = this.app.tools.random(80, 100);
        this.polygons = [];
        this.size = {
            width: size,
            height: size
        };
        this.initialSize = size;
        this.amount = size;
        this.minSize = 30;
        this.requestFlags = {};
        this.maxAge = this.app.tools.random(100, 200);
        this.coords = {
            x: this.app.tools.random(120, (width - (size * 2))) * (Math.random() >= 0.5 ? 1 : -1),
            y: this.app.tools.random(120, (height - (size * 2))) * (Math.random() >= 0.5 ? 1 : -1)
        };
        this.angle = this.app.tools.random(0, 3.6);
        this.color = '#33211c';
    }

    /**
     * Draw and Update methods
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

    #age() {
        if (this.app.request - (this.requestFlags.age ?? 0) < 1000) return;
        this.requestFlags.age = this.app.request;
        this.age += 1;
        if (this.age > this.maxAge) {
            this.app.factory.remove(this);
            this.energy = 0;
        }
    }

    #updateSize() {
        (this.amount >= this.minSize) && (this.width = this.amount);
        (this.amount >= this.minSize) && (this.height = this.amount);
        (this.amount <= 0) && this.app.factory.remove(this);
    }

    update() {
        if (!this.no_update && this.app.game.state.state === PLAY || this.app.game.state.state === GAME_OVER) {
            this.#updateSize();
            this.#age();
            this.app.gui.get.createPolygon(this);
        }
    }

    draw() {
        if (!this.no_draw && this.app.game.state.state === PLAY || this.app.game.state.state === GAME_OVER) {
            this.app.gui.get.drawPolygon(this.app.gui.ctx, this);
            (this.amount < this.initialSize) &&
            this.app.gui.get.bar({
                ctx: this.app.gui.ctx,
                x: this.coords.x - this.initialSize / 2,
                y: this.coords.y - this.height * 1.3,
                fillColor: 'red-green',
                barColor: 'rgba(0,0,0,0.5)',
                cap: this.initialSize,
                fill: this.amount,
            }, false);
        }
    }
}