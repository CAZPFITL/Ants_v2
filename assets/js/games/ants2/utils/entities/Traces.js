export default class Traces {
    constructor({ app }) {
        this.app = app;
        this.points = [];
        console.log(this)
    }

    addPoint(point) {
        this.points.push(point);
    }

    removePoint(point) {
        this.points.splice(this.points.indexOf(point), 1);
    }

    draw() {
        for (let i = 0; i < this.points.length; i++) {
            // draw circle of random radius
            this.app.gui.ctx.fillStyle = 'rgba(255,207,0,0.34)';
            this.app.gui.ctx.beginPath();
            this.app.gui.ctx.arc(
                this.points[i].x,
                this.points[i].y,
                this.points[i].radius,
                0,
                2 * Math.PI);
            this.app.gui.ctx.fill()
        }
    }
}