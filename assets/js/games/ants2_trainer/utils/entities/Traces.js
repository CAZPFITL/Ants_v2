export default class Traces {
    constructor({ app }) {
        this.app = app;
        this.collection = [];
        this.requestFlag = 0;
    }

    addTrace(traceData) {
        this.collection.push(new Trace(traceData));
    }

    removeTrace(trace) {
        this.collection.splice(this.collection.indexOf(trace), 1);
    }

    update() {
        if (this.app.request - (this.requestFlag ?? 0) < 300) return;
        this.requestFlag = this.app.request;
        this.removeTrace(this.collection[0]);
    }

    draw() {
        for (let i = 0; i < this.collection.length; i++) {
            // draw circle of random radius
            this.app.gui.ctx.fillStyle = 'rgba(255,207,0,0.34)';
            this.app.gui.ctx.beginPath();
            this.app.gui.ctx.arc(
                this.collection[i].x,
                this.collection[i].y,
                this.collection[i].radius,
                0,
                2 * Math.PI);
            this.app.gui.ctx.fill()
        }
    }
}

class Trace {
    constructor({ x, y, radius, polygons }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.polygons = polygons
    }
}