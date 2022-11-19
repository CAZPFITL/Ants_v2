export default class Traces {
    constructor({app, anthill}) {
        this.app = app;
        this.anthill = anthill;
        this.collection = [];
        this.requestFlag = 0;
        this.requestFlags = {};
        this.props = {
            min: 50,
            max: 50,
            spreadMark: 4
        }
    }

    static createTraces(app, anthill) {
        if (!app.factory.binnacle['Traces'] || !app.factory.binnacle['Traces'][0]) {
            app.factory.create(Traces, {
                app,
                anthill
            });
        }
    }

    markTrace(position, props = this.props) {
        if (!(this.app.request - (this.requestFlags.mark ?? 0) > this.app.tools.random(props.min, props.max)))
            return;

        this.requestFlags.mark = this.app.request;

        this.app.factory.binnacle['Traces'][0].addTrace({
            x: this.app.tools.random(position.x, position.x, false),
            y: this.app.tools.random(position.y, position.y, false),
            radius: this.app.tools.random(2, 2.5, false),
            polygons: [{
                x: position.x - 2,
                y: position.y - 2,
            }, {
                x: position.x - 2,
                y: position.y + 2,
            }, {
                x: position.x + 2,
                y: position.y + 2,
            }, {
                x: position.x + 2,
                y: position.y - 2,
            }]
        });
    }

    addTrace(traceData) {
        this.collection.push(new Trace(traceData));
    }

    removeTrace(trace) {
        this.collection.splice(this.collection.indexOf(trace), 1);
    }

    update() {
        if (this.app.game.state.state === 'PLAY') {
            if (this.app.request - (this.requestFlag ?? 0) < 5000) return;
            this.requestFlag = this.app.request;
            // this.removeTrace(this.collection[0]);
        }
    }

    draw() {
        if (this.app.game.state.state === 'PLAY') {
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
}

class Trace {
    constructor({x, y, radius, polygons}) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.polygons = polygons
    }
}