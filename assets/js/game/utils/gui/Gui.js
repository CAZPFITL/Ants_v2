export default class Gui {
    constructor(app, game) {
        this.app = app
        this.game = game
        this.controlsCtx = this.app.gui.controlsCtx
        this.ctx = this.app.gui.ctx
        this.#updateControlsData();
    }

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
            this.app.gui.button(looper[key]);
        });
    }

    drawGameData(ctx = this.controlsCtx) {
        // TODO create and update screen data variable carring all this consts
        const player = `Player: ${this.app.player.entity ? this.app.player.entity.name : 'No Ant Selected'}`;
        const anthillFood = `Anthill Food: ${this.app.tools.xDecimals(this.game.anthill.food, 0)}`;
        const anthillAnts = `Anthill Ants: ${this.game.anthill.ants}`;
        const pickedBar = `${this.app.player.entity ? this.app.player.entity.name : 'No Ant Selected'} Food: ${this.app.tools.xDecimals(this.app.player.entity.pickedFood, 0)} / ${this.app.tools.xDecimals(this.app.player.entity.maxFoodPickCapacity, 0)}`
        const pickedCapacity = this.app.player.entity.maxFoodPickCapacity * 10;
        const hungerText = `${this.app.player.entity ? this.app.player.entity.name : 'No Ant Selected'} Hunger: ${this.app.tools.xDecimals(this.app.player.entity.hunger * 10, 2)} / ${100}`
        const hungerCapacity = 100;
        const sample = [
            ctx.measureText(player).width,
            ctx.measureText(anthillFood).width,
            ctx.measureText(anthillAnts).width,
            ctx.measureText(pickedBar).width,
            pickedCapacity,
            hungerCapacity
        ];

        let maxByFor = sample[0];
        for (let index = 1; index < sample.length; index++) {
            if (sample[index] > maxByFor) {
                maxByFor = sample[index];
            }
        }
        const width = maxByFor;

        this.app.gui.square({
            ctx: this.controlsCtx,
            x: 5,
            y: 10,
            width: width + 35,
            height: 190,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });
        this.app.gui.text({
            ctx,
            font: "20px Mouse",
            color: "#000",
            text: player,
            x: 20,
            y: 40
        });
        this.app.gui.text({ctx, font: "20px Mouse", color: "#000", text: anthillAnts, x: 20, y: 70});
        this.app.gui.text({
            ctx,
            font: "20px Mouse",
            color: "#000",
            text: anthillFood,
            x: 20,
            y: 100
        });
        this.app.gui.bar({
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
        this.app.gui.bar({
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
                this.game.anthill.addAnt();
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

    update() {
        (this.game.state.state === 'PLAY') && this.drawControls();
        (this.game.state.state === 'PLAY') && this.drawGameData();
        (this.game.state.state === 'PLAY') && this.#updateControlsData();
    }
}