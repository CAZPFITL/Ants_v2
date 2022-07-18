export default class Food {
    constructor({app, x, y}) {
        this.app = app;
        this.getFoodData({x, y});
    }

    getFoodData({x, y}) {
        this.polygons = [];
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 80;
        this.angle = 0;
        this.color = '#ff6600';
    }

    update() {
        this.app.gui.createPolygon(this);
    }

    draw() {
        this.app.gui.drawPolygon(this.app.gui.ctx, this);
    }
}