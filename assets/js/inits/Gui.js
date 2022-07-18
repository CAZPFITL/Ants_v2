export default class Gui {
    constructor(app) {
        this.app = app;
        app.inits.push(this.init.bind(this));
    }

    init() {
        this.ctx = this.createCanvas('gameCanvas');
        this.controlsCtx = this.createCanvas('controlsCanvas');
    }

    createCanvas(id) {
        const canvas = document.getElementById(id);
        canvas.width = window.innerWidth;
        return canvas.getContext('2d');
    }

    drawPolygon(ctx, entity) {
        ctx.beginPath();
        ctx.moveTo(entity.polygons[0].x, entity.polygons[0].y);

        for (let i = 1; i < entity.polygons.length; i++) {
            ctx.lineTo(entity.polygons[i].x, entity.polygons[i].y);
        }

        ctx.fillStyle = entity.color ?? '#000';
        ctx.fill();
    }

    createPolygon(entity) {
        const points = [];
        this.rectangle(entity).forEach(point => {
            points.push({
                x: point.x,
                y: point.y
            });
        });
        entity.polygons = points;
    }

    rectangle(entity) {
        const rad = Math.hypot(entity.width, entity.height) / 2;
        const alpha = Math.atan2(entity.width, entity.height);
        return [
            {
                x: entity.x - Math.sin(entity.angle - alpha) * rad,
                y: entity.y - Math.cos(entity.angle - alpha) * rad
            },
            {
                x: entity.x - Math.sin(entity.angle + alpha) * rad,
                y: entity.y - Math.cos(entity.angle + alpha) * rad
            },
            {
                x: entity.x - Math.sin(Math.PI + entity.angle - alpha) * rad,
                y: entity.y - Math.cos(Math.PI + entity.angle - alpha) * rad
            },
            {
                x: entity.x - Math.sin(Math.PI + entity.angle + alpha) * rad,
                y: entity.y - Math.cos(Math.PI + entity.angle + alpha) * rad
            }
        ]
    }

    button({ctx, x, y, width, height, text, onClick}) {
        // create a button to be used in the canvas
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    drawControls() {
        const width = this.controlsCtx.canvas.width * 0.11;
        const height = this.controlsCtx.canvas.height * 0.1;
        this.button({
            ctx: this.controlsCtx,
            x: this.controlsCtx.canvas.width - width,
            y: this.controlsCtx.canvas.height - height,
            width: 100,
            height: 50,
            text: 'Show Sensors',
            onClick: () => {
                console.log('show sensors');
                this.app.show();
            }
        })
    }
}