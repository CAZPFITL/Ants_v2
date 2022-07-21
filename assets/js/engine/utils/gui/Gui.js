export default class Gui {
    constructor(app) {
        this.app = app;
        this.ctx = this.#createCanvas('gameCanvas');
        this.controlsCtx = this.#createCanvas('controlsCanvas');
        this.#updateControlsData();
    }

    /**
     * Private
     */
    // TODO move this to controls
    #updateControlsData() {
        const font = "16px Mouse"
        this.movementControls =  {
            'forward': {
                x: this.controlsCtx.canvas.width - 120,
                y: this.controlsCtx.canvas.height - 120,
                width: 50,
                height: 50,
                text: '↑',
                font
            },
            'reverse': {
                x: this.controlsCtx.canvas.width - 120,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '↓️',
                font
            },
            'left': {
                x: this.controlsCtx.canvas.width - 180,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '←',
                font
            },
            'right': {
                x: this.controlsCtx.canvas.width - 60,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '→️',
                font
            }
        }
    }

    #createCanvas(id) {
        const canvas = document.getElementById(id);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return canvas.getContext('2d');
    }

    /**
     * Polygons
     */
    createPolygon(entity) {
        const points = [];
        entity.shape().forEach(point => {
            points.push({
                x: point.x,
                y: point.y
            });
        });
        entity.polygons = points;
    }

    drawPolygon(ctx = this.ctx, entity) {
        ctx.beginPath();
        ctx.moveTo(entity.polygons[0].x, entity.polygons[0].y);

        for (let i = 1; i < entity.polygons.length; i++) {
            ctx.lineTo(entity.polygons[i].x, entity.polygons[i].y);
        }

        ctx.fillStyle = entity.color ?? '#000';
        ctx.fill();
    }

    createCustomShape(entity, points) {
        const unit = 10
        // we need to rotate the polygon around the center of the car so we add 90 degrees to the angle
        entity.polygons = points.map(point => ({
            x: entity.x - Math.sin(entity.angle - point.lambda) * unit * point.radius,
            y: entity.y - Math.cos(entity.angle - point.lambda) * unit * point.radius
        }))
    }

    /**
     * Screen
     */
    button({ctx, font, x, y, width, height, text}) {
        // create a button to be used in the canvas
        this.square({ctx, x, y, width, height, color: '#ffa600', stroke: '#000'});
        this.text({ctx, font, color: '#000', text, x, y, width, height});
    }

    square({ctx, x, y, width, height, color, stroke}) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = color;
        ctx.fill();
        stroke && (ctx.strokeStyle = stroke);
        stroke && ctx.stroke();
    }

    text({ctx, font, color, text, x, y, width, height}) {
        ctx.font = font;
        ctx.fillStyle = color;
        const xText = x + width / 2 - ctx.measureText(text).width / 2;
        const yText = y + height / 2 + 5;
        ctx.fillText(text, xText, yText);
    }

    addListeners(e) {
        const onMouseDown = (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
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

        const onMouseUp = (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
            const controlAnt = this.movementControls;

            Object.keys(controlAnt).forEach(key => {
                if (
                    x > controlAnt[key].x &&
                    x < controlAnt[key].x + controlAnt[key].width &&
                    y > controlAnt[key].y &&
                    y < controlAnt[key].y + controlAnt[key].height
                ) {
                    this.app.player.controls[key] = false;
                }
            });
        }


        return {
            onmousedown: [
                onMouseDown,
            ],
            onmouseup: [
                onMouseUp,
            ]
        }
    }

    /**
     * In game draw section
     */
    drawControls(ctx = this.controlsCtx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const controlAnt = {
            forward: {ctx, ...this.movementControls.forward,},
            reverse: {ctx, ...this.movementControls.reverse,},
            left: {ctx, ...this.movementControls.left,},
            right: {ctx, ...this.movementControls.right,},
        }

        Object.keys(controlAnt).forEach(key => {
            this.button(controlAnt[key]);
        });
    }

    drawGameData(ctx = this.controlsCtx) {
        ctx.font = "20px Mouse";
        ctx.fillStyle = '#000000';
        ctx.fillText(`Player: ${this.app.player.entity ? this.app.player.entity.name : 'No Ant Selected'}`, 10, 30);
        ctx.fillText(`Ants: ${this.app.anthill.ants}`, 10, 60);
        ctx.fillText(`Food: ${this.app.anthill.food}`, 10, 90);
    }

    update() {
        this.#updateControlsData();
    }

    draw() {
        // TODO add the state pattern
        if (this.app.state.state === 'play') {
            this.drawControls();
            this.drawGameData();
        }
    }
}