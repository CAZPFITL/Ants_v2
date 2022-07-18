export default class Gui {
    constructor(app) {
        this.app = app;
        app.inits.push(this.init.bind(this));
    }

    init() {
        this.ctx = this.createCanvas('gameCanvas');
        this.controlsCtx = this.createCanvas('controlsCanvas');
        this.movementControls = {
            up: {
                x: this.controlsCtx.canvas.width - 120,
                y: this.controlsCtx.canvas.height - 120,
                width: 50,
                height: 50,
                text: 'up'
            },
            down: {
                x: this.controlsCtx.canvas.width - 120,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: 'down'
            },
            left: {
                x: this.controlsCtx.canvas.width - 180,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: 'left'
            },
            right: {
                x: this.controlsCtx.canvas.width - 60,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: 'right'
            }
        }
    }

    createCanvas(id) {
        const canvas = document.getElementById(id);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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

    button({ctx, x, y, width, height, text}) {
        // create a button to be used in the canvas
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = '#ffd5e5';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
    }

    drawControls() {
        const ctx = this.controlsCtx;
        const width = this.controlsCtx.canvas.width;
        const height = this.controlsCtx.canvas.height;

        const controlAnt = {
            up: {ctx, ...this.movementControls.up,},
            down: {ctx, ...this.movementControls.down,},
            left: {ctx, ...this.movementControls.left,},
            right: {ctx, ...this.movementControls.right,},
        }

        Object.keys(controlAnt).forEach(key => {
            this.button(controlAnt[key]);
        });
    }

    addListeners(e) {
        const onClick = (e) => {
            const x = e.offsetX;
            const y = e.offsetY;
            const controlAnt = this.movementControls;

            Object.keys(controlAnt).forEach(key => {
                if (
                    x > controlAnt[key].x &&
                    x < controlAnt[key].x + controlAnt[key].width &&
                    y > controlAnt[key].y &&
                    y < controlAnt[key].y + controlAnt[key].height
                ) {
                    this.app.player.controls[key] = true;
                }
            });
        }

        return {
            onclick: [
                onClick,
            ]
        }
    }
}