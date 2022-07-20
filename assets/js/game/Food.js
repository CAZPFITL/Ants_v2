export default class Food {
    constructor({app, x, y}) {
        this.app = app;
        this.#getFoodData({x, y});
    }
    /**
     * Private
     */
    #getFoodData({x, y}) {
        const size = this.app.tools.random(10, 20);
        this.polygons = [];
        this.x = x;
        this.y = y;
        this.width = size * this.app.tools.random(1, 5);
        this.height = size * this.app.tools.random(1, 5);
        this.angle = 0;
        this.amount = 1000;
        this.color = '#ff6600';
    }

    /**
     * In game draw section
     */
    shape() {
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        return [
            {
                x: this.x - Math.sin(this.angle - alpha) * rad,
                y: this.y - Math.cos(this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(this.angle + alpha) * rad,
                y: this.y - Math.cos(this.angle + alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
            }
        ]
    }

    update() {
        (this.amount <= 0) && (this.app.factory.binnacle.Food = this.app.factory.binnacle.Food.filter(food => food !== this));
        this.app.gui.createPolygon(this);
    }

    draw() {
        this.app.gui.drawPolygon(this.app.gui.ctx, this);
    }
}