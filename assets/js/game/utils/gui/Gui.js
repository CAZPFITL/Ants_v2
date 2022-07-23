import Screen from './Screen.js';

export default class Gui {
    constructor(app, game) {
        this.app = app
        this.no_update = false;
        this.no_draw = false;
        this.screen = new Screen(app, this);
        // Ctx
        this.controlsCtx = this.app.gui.controlsCtx
        this.ctx = this.app.gui.ctx
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
            }, 'reverse': {
                x: this.controlsCtx.canvas.width - 120,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '↓️',
                font
            }, 'left': {
                x: this.controlsCtx.canvas.width - 180,
                y: this.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '←',
                font
            }, 'right': {
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
                x: this.controlsCtx.canvas.width - 60, y: 10, width: 50, height: 50, text: '🐜', font
            }, 'pick': {
                x: this.controlsCtx.canvas.width - 60, y: 70, width: 50, height: 50, text: '🚚', font
            }, 'eat': {
                x: this.controlsCtx.canvas.width - 60, y: 130, width: 50, height: 50, text: '🍏', font
            }
        }
    }

    drawGameLevelControls(ctx = this.controlsCtx) {
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

    drawGameLevelData(ctx = this.controlsCtx) {
        const {
            color,
            font,
            anthillAnts,
            anthillFood,
            antSelected,
            pickedBarText,
            hungerText,
            entity
        } = this.app.game.level.gameLevelDataStrings();

        // CALCULATE MAX CONTENT WIDTH FROM ALL ELEMENTS
        const width = this.app.tools.max([
            ctx.measureText(antSelected).width,
            ctx.measureText(anthillFood).width,
            ctx.measureText(anthillAnts).width,
            ctx.measureText(pickedBarText).width,
            entity.maxFoodPickCapacity * 10,
            100
        ]);
        // DATA BACKGROUND
        this.app.gui.square({
            ctx: this.controlsCtx,
            x: 5,
            y: 10,
            width: width + 35,
            height: 190,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });

        // PLAYER ENTITY
        this.app.gui.text({
            ctx, font, color, text: antSelected, x: 20, y: 40
        });
        // ANTHILL DATA
        this.app.gui.text({ctx, font, color, text: anthillAnts, x: 20, y: 70});
        // FOOD DATA
        this.app.gui.text({
            ctx, font, color, text: anthillFood, x: 20, y: 100
        });
        // FOOD BAR
        this.app.gui.bar({
            ctx,
            x: 20,
            y: 135,
            text: pickedBarText,
            cap: entity.maxFoodPickCapacity * 10,
            fill: entity.pickedFood * 10,
            fillColor: 'green-red',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);
        // HUNGER BAR
        this.app.gui.bar({
            ctx,
            x: 20,
            y: 175,
            text: hungerText,
            cap: 100,
            fill: entity.hunger * 10,
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
                ...this.movementControls, pick: this.anthillControls.pick
            };
            Object.keys(controls).forEach(key => {
                if (x > controls[key].x && x < controls[key].x + controls[key].width && y > controls[key].y && y < controls[key].y + controls[key].height) {
                    this.app.player.controls[key] = 1;
                }
            });
        }

        const onMouseUp = (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
            const controls = {
                ...this.movementControls, pick: this.anthillControls.pick
            };

            Object.keys(controls).forEach(key => {
                if (x > controls[key].x && x < controls[key].x + controls[key].width && y > controls[key].y && y < controls[key].y + controls[key].height) {
                    this.app.player.controls[key] = 0;
                }
            });
        }

        const onClick = (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};

            if (x > this.anthillControls.createAnt.x && x < this.anthillControls.createAnt.x + this.anthillControls.createAnt.width && y > this.anthillControls.createAnt.y && y < this.anthillControls.createAnt.y + this.anthillControls.createAnt.height) {
                this.app.player.anthill.addAnt();
            }

        }

        return {
            onmousedown: [onMouseDown], onmouseup: [onMouseUp], onclick: [onClick]
        }
    }

    update() {
        if (!this.no_update) {
            this.#updateControlsData();
            this.screen.update();
        }
    }

    draw() {
        if (!this.no_draw) {
            this.screen.draw();
        }
    }
}