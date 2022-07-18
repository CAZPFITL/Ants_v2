export default class Food {
    constructor(app, {x, y, radius}) {
        this.app = app;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = '#523f32';
    }

    draw() {
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.beginPath();
        this.app.gui.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.app.gui.ctx.fill();
    }
}