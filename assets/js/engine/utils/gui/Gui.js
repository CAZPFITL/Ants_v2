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
        this.movementControls = {
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
        this.anthillControls = {
            'createAnt': {
                x: this.controlsCtx.canvas.width - 60,
                y: 10,
                width: 50,
                height: 50,
                text: '🐜',
                font
            },
            'pick': {
                x: this.controlsCtx.canvas.width - 60,
                y: 70,
                width: 50,
                height: 50,
                text: '🚚',
                font
            },
            'eat': {
                x: this.controlsCtx.canvas.width - 60,
                y: 130,
                width: 50,
                height: 50,
                text: '🍏',
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
     * Screen instantiable objects
     */
    button({ctx, font, x, y, width, height, text}) {
        // create a button to be used in the canvas
        this.square({ctx, x, y, width, height, color: '#ffa600', stroke: '#000'});
        this.text({ctx, font, color: '#000', text, x, y, width, height, center: true});
    }

    square({ctx, x, y, width, height, color = '#FFF', stroke = false}) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = color;
        ctx.fill();
        stroke && (ctx.strokeStyle = stroke);
        stroke && ctx.stroke();
    }

    text({ctx, font, color, text, x, y, width, height, center = false}) {
        ctx.font = font;
        ctx.fillStyle = color;
        const xText = x + width / 2 - ctx.measureText(text).width / 2;
        const yText = y + height / 2 + 5;
        ctx.fillText(text, center ? xText : x, center ? yText : y);
        return ctx.measureText(text).width;
    }

    bar({ctx, x, y, text, cap, fill, height = 10, fillColor, barColor = 'transparent', stroke}, negative = false) {
        const normalizedProgress = fill / (cap / 255);
        const progress = negative ? (cap - fill) : fill

        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, cap, height);
        stroke && (ctx.strokeStyle = stroke);
        stroke && (ctx.strokeRect(x, y, cap, height));

        ctx.fillStyle = fillColor === 'green-red' ?
            `rgb(${normalizedProgress}, ${255 - normalizedProgress}, 0)` :
            'red-green' ? `rgb(${255 - normalizedProgress}, ${normalizedProgress}, 0)` : fillColor;
        ctx.fillRect(x, y, progress, height);


        text && (this.text({ctx, font: '12px Mouse', color: '#000', text, x, y: y - height}));
    }

    /**
     * Listeners
     */
    addListeners(e) {
        const onMouseDown = (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
            const controls = {
                ...this.movementControls,
                pick: this.anthillControls.pick
            };
            Object.keys(controls).forEach(key => {
                if (
                    x > controls[key].x &&
                    x < controls[key].x + controls[key].width &&
                    y > controls[key].y &&
                    y < controls[key].y + controls[key].height
                ) {
                    this.app.player.controls[key] = 1;
                }
            });
        }

        const onMouseUp = (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
            const controls = {
                ...this.movementControls,
                pick: this.anthillControls.pick
            };

            Object.keys(controls).forEach(key => {
                if (
                    x > controls[key].x &&
                    x < controls[key].x + controls[key].width &&
                    y > controls[key].y &&
                    y < controls[key].y + controls[key].height
                ) {
                    this.app.player.controls[key] = 0;
                }
            });
        }

        const onClick = (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};

            if (
                x > this.anthillControls.createAnt.x &&
                x < this.anthillControls.createAnt.x + this.anthillControls.createAnt.width &&
                y > this.anthillControls.createAnt.y &&
                y < this.anthillControls.createAnt.y + this.anthillControls.createAnt.height
            ) {
                this.app.anthill.addAnt();
            }

        }

        return {
            onmousedown: [
                onMouseDown
            ],
            onmouseup: [
                onMouseUp
            ],
            onclick: [
                onClick
            ]
        }
    }

    /**
     * In game draw section
     */
    drawControls(ctx = this.controlsCtx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        const looper = {
            forward: {ctx, ...this.movementControls.forward,},
            reverse: {ctx, ...this.movementControls.reverse,},
            left: {ctx, ...this.movementControls.left,},
            right: {ctx, ...this.movementControls.right},
            createAnt: {ctx, ...this.anthillControls.createAnt},
            pick: {ctx, ...this.anthillControls.pick},
            eat: {ctx, ...this.anthillControls.eat},
        }

        Object.keys(looper).forEach(key => {
            this.button(looper[key]);
        });
    }

    drawGameData(ctx = this.controlsCtx) {
        // get min number from array
        const minWidth = (arr) => Math.max(...arr);
        const player = `Player: ${this.app.player.entity ? this.app.player.entity.name : 'No Ant Selected'}`;
        const anthillFood = `Anthill Food: ${this.app.tools.xDecimals(this.app.anthill.food, 0)}`;
        const anthillAnts = `Anthill Ants: ${this.app.anthill.ants}`;
        const pickedBar = `${this.app.player.entity ? this.app.player.entity.name : 'No Ant Selected'} Food: ${this.app.tools.xDecimals(this.app.player.entity.pickedFood, 0)} / ${this.app.tools.xDecimals(this.app.player.entity.maxFoodPickCapacity, 0)}`
        const pickedCapacity = this.app.player.entity.maxFoodPickCapacity * 10;
        const hungerText = `${this.app.player.entity ? this.app.player.entity.name : 'No Ant Selected'} Hunger: ${this.app.tools.xDecimals(this.app.player.entity.hunger * 10, 2)} / ${100}`
        const hungerCapacity = 100;

        this.square({
            ctx: this.controlsCtx,
            x: 5,
            y: 10,
            width: minWidth([
                ctx.measureText(player).width,
                ctx.measureText(anthillFood).width,
                ctx.measureText(anthillAnts).width,
                ctx.measureText(pickedBar).width,
                pickedCapacity,
                hungerCapacity
            ]) + 35,
            height: 190,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });
        this.text({
            ctx,
            font: "20px Mouse",
            color: "#000",
            text: player,
            x: 20,
            y: 40
        });
        this.text({ctx, font: "20px Mouse", color: "#000", text: anthillAnts, x: 20, y: 70});
        this.text({
            ctx,
            font: "20px Mouse",
            color: "#000",
            text: anthillFood,
            x: 20,
            y: 100
        });
        this.bar({
            ctx,
            x: 20,
            y: 135,
            text: pickedBar,
            cap: pickedCapacity,
            fill: this.app.player.entity.pickedFood * 10,
            fillColor: 'green-red',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);
        this.bar({
            ctx,
            x: 20,
            y: 175,
            text: hungerText,
            cap: hungerCapacity,
            fill: this.app.player.entity.hunger * 10,
            fillColor: 'red-green',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);
    }

    update() {
        this.#updateControlsData();
    }

    draw() {
        if (this.app.state.state === 'play') {
            this.drawControls();
            this.drawGameData();
        }
    }
}