import {PLAY} from "../../../../engine/utils/components/MusicBox.js";

export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.redux = false;
        this.#updatePlayControlsData();
        this.#addListeners();
    }
    /**
     * Private
     */
    #addListeners() {
        this.app.controls.pushListener('click', (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
            this.app.gui.get.isClicked(
                this.anthillControls.createAnt,
                {x, y},
                ()=> this.app.player.anthill.addAnt()
            )
            this.app.gui.get.isClicked(
                this.antControls.pick,
                {x, y},
                ()=> this.app.player.controls.pick = !this.app.player.controls.pick
            )
            this.app.gui.get.isClicked(
                this.gameControls.sound,
                {x, y},
                ()=> this.app.musicBox.toggle()
            )
        });
    }

    #updatePlayControlsData() {
        const font = "16px Mouse";
        const bg = !this.redux ? '#b47607' : '#ffa600'
        this.movementControls = {
            'forward': {
                x: this.gui.controlsCtx.canvas.width - 120,
                y: this.gui.controlsCtx.canvas.height - 120,
                width: 50,
                height: 50,
                text: '↑',
                font,
                bg: !this.app.player?.controls.forward ? '#b47607' : '#ffa600'
            },
            'reverse': {
                x: this.gui.controlsCtx.canvas.width - 120,
                y: this.gui.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '↓️',
                font,
                bg: !this.app.player?.controls.reverse ? '#b47607' : '#ffa600'
            },
            'left': {
                x: this.gui.controlsCtx.canvas.width - 180,
                y: this.gui.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '←',
                font,
                bg: !this.app.player?.controls.left ? '#b47607' : '#ffa600'
            },
            'right': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: this.gui.controlsCtx.canvas.height - 60,
                width: 50,
                height: 50,
                text: '→️',
                font,
                bg: !this.app.player?.controls.right ? '#b47607' : '#ffa600'
            }
        }
        this.anthillControls = {
            'createAnt': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 10,
                width: 50,
                height: 50,
                text: '🐜',
                font,
                bg
            }
        }
        this.antControls = {
            'pick': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 70,
                width: 50,
                height: 50,
                text: '🚚',
                font,
                bg: !this.app.player?.controls.pick ? '#b47607' : '#ffa600'
            },
            'eat': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 130,
                width: 50,
                height: 50,
                text: '🍏',
                font,
                bg: !this.app.player?.controls.eat ? '#b47607' : '#ffa600'
            }
        }
        this.gameControls = {
            'sound': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 190,
                width: 50,
                height: 50,
                text: '🔈',
                font,
                bg: this.app.musicBox.state.state !== PLAY ? '#b47607' : '#ffa600'
            }
        }

    }

    /**
     * Draw and update section
     */
    drawGameLevelControls() {
        const ctx = this.app.game.gui.controlsCtx;

        const looper = {
            forward: {ctx, ...this.movementControls.forward,},
            reverse: {ctx, ...this.movementControls.reverse,},
            left: {ctx, ...this.movementControls.left,},
            right: {ctx, ...this.movementControls.right},
            pick: {ctx, ...this.antControls.pick},
            eat: {ctx, ...this.antControls.eat},
            createAnt: {ctx, ...this.anthillControls.createAnt},
            sound: {ctx, ...this.gameControls.sound},
        }

        Object.keys(looper).forEach(key => {
            this.app.gui.get.button(looper[key]);
        });
    }

    drawGameLevelData() {
        const ctx = this.app.game.gui.controlsCtx;
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
        this.app.gui.get.square({
            ctx: this.app.game.gui.controlsCtx,
            x: 5,
            y: 10,
            width: width + 35,
            height: 190,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });

        // PLAYER ENTITY
        this.app.gui.get.text({
            ctx, font, color, text: antSelected, x: 20, y: 40
        });
        // ANTHILL DATA
        this.app.gui.get.text({ctx, font, color, text: anthillAnts, x: 20, y: 70});
        // FOOD DATA
        this.app.gui.get.text({
            ctx, font, color, text: anthillFood, x: 20, y: 100
        });
        // FOOD BAR
        this.app.gui.get.bar({
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
        this.app.gui.get.bar({
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

    update() {
        if (this.app.game.state.state === 'PLAY' && this.app.game.level) {
            this.#updatePlayControlsData();
        }
    }

    draw() {
        // MAIN MENU SCREEN ELEMENTS
        // TODO Add some main menu screen elements

        // PLAY GAME LEVEL CONTROLS SCREEN ELEMENTS
        if (this.app.game.state.state === 'PLAY' && this.app.game.level) {
            this.drawGameLevelControls();
            this.drawGameLevelData();
        }
    }
}