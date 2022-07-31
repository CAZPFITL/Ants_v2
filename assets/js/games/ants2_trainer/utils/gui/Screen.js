import {PLAY, MAIN_MENU, GAME_OVER} from "../../env.js";

export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.hoverCollection = {};
        this.buttons = {
            play: {
                creatingAnt: false,
            },
            main_menu: {
                start: false
            }
        }
        this.buttonsCollection = {
            main_menu: {
                mainMenuControls: {
                    'start': {}
                }
            },
            play: {
                anthillControls: {
                    'createAnt': {}
                },
            }
        }
        this.#updatePlayControlsData();
        this.#updateMainMenuData();
        this.#addListeners();
    }

    /**
     * Private methods
     */
    #addListeners() {
        // mouse move listener
        document.addEventListener('mousemove', (e) => {
            for (const key in this.hoverCollection) {
                if (this.app.gui.get.isHover(this.hoverCollection[key], {x: e.clientX, y: e.clientY})) {
                    this.hoverCaller = key;
                    this.gui.hoverStateIn();
                } else {
                    if  (this.hoverCaller === key) {
                        this.hoverCaller = null;
                        this.gui.hoverStateOut();
                    }
                }
            }
        });
        this.app.controls.pushListener('click', (e) => {
            // Create Ant
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.anthillControls.createAnt,
                {x: e.offsetX, y: e.offsetY},
                () => this.app.player.anthill.addAnt()
            )
        });
        this.app.controls.pushListener('mouseup', (e) => {
            // Start Game
            this.app.gui.get.isClicked(
                this.buttonsCollection.main_menu.mainMenuControls.start,
                this.app.gui.get.clickCoords(e, this.app.camera.viewport),
                () => {
                    this.buttons.main_menu.start = false;
                    this.app.game.state.setState(PLAY);
                }
            );
            // Create ant up
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.anthillControls.createAnt,
                {x: e.offsetX, y: e.offsetY},
                () => this.buttons.play.creatingAnt = false
            )
        });
        this.app.controls.pushListener('mousedown', (e) => {
            // Show fps
            (e.which === 2) && this.app.gui.get.isClicked(
                {
                    x: 0,
                    y: 0,
                    width: this.app.gui.ctx.canvas.width,
                    height: this.app.gui.ctx.canvas.height
                },
                {x: e.offsetX, y: e.offsetY},
                () => this.app.toggleStats()
            );

            this.app.gui.get.isClicked(
                this.buttonsCollection.main_menu.mainMenuControls.start,
                this.app.gui.get.clickCoords(e, this.app.camera.viewport),
                () => this.buttons.main_menu.start = true
            );
            // Create ant down
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.anthillControls.createAnt,
                {x: e.offsetX, y: e.offsetY},
                () => this.buttons.main_menu.start = true
            )
        });
    }


    #getPlayDataStrings() {
        // TODO consider to make multiple anthills
        const antHill = this.app.factory.binnacle?.Anthill[0]
        const entity = this.app.player.ant
        const dec = this.app.tools.xDec
        const {ants, food, player} = {
            ants: antHill.antCounter ?? "n/a",
            food: dec(antHill.food, 0),
            player: {
                name: `Ant #${entity?.id ?? 'N/A'} Anthill #${entity?.home?.id ?? 'N/A'}`,
                energy: dec((entity?.energy ?? 1) * 10, 2) ?? 0,
                maxFoodPickCapacity: entity?.maxFoodPickCapacity ?? 100,
                maxPickedFood: entity?.maxPickedFood ?? 0,
                pickedFood: entity?.pickedFood ?? 0,
            }
        }

        return {
            color: '#000000',
            font: "20px Mouse",
            antSelected: `${player.name}`,
            pickedBarText: `Picked Food: ${dec(player.pickedFood, 0)} / ${dec(player.maxFoodPickCapacity, 0)}`,
            energyText: `Energy: ${dec(player.energy / 10, 0)} / ${100}`,
            entity
        }
    }

    #updateMainMenuData() {
        const font = "16px Mouse";
        this.buttonsCollection.main_menu.mainMenuControls = {
            'start': {
                x: -150,
                y: 30,
                width: 300,
                height: 50,
                text: 'Start',
                font,
                bg: !this.buttons.main_menu.start ? '#d28b05' : '#ffa600'
            }
        }
    }

    #updatePlayControlsData() {
        const font = "16px Mouse";
        this.buttonsCollection.play.anthillControls = {
            'createAnt': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 10,
                width: 50,
                height: 50,
                text: '🐜',
                font,
                bg: !this.buttons.play.creatingAnt ? '#b47607' : '#ffa600'
            }
        }
    }

    #updatePlayCamera() {
        if (!this.app.player.ant?.speed) return;

        this.app.player.followCamera &&
        this.app.player.ant.speed !== 0 &&
        this.app.camera.follow(this.app.player.ant);
    }

    /**
     * Draw screens
     */
    drawMainMenuScreen() {
        this.drawMainMenuDecoration();
        this.drawMainMenuControls();
    }

    drawPlayScreen() {
        this.drawPlayDecoration();
        this.drawPlayControls();
    }

    /**
     * Draw Decoration / Controls
     */
    drawMainMenuDecoration() {
        this.app.gui.get.square({
            ctx: this.app.gui.ctx,
            x: -300,
            y: -120,
            width: 600,
            height: 250,
            color: '#72604e',
            stroke: '#000000',
        });
        this.app.gui.get.text({
            ctx: this.app.gui.ctx,
            font: "70px Mouse",
            text: 'Ants AI Trainer',
            x: 0,
            y: -35,
            color: '#ffffff',
            width: this.app.gui.ctx.measureText('Ants').width,
            height: 30,
            center: true
        });
        this.app.gui.ctx.canvas.style.backgroundColor = 'rgb(130,169,30)';
    }

    drawMainMenuControls() {
        const ctx = this.app.gui.ctx;

        const looper = {
            start: {ctx, ...this.buttonsCollection.main_menu.mainMenuControls.start}
        }

        Object.keys(looper).forEach(key => {
            this.app.gui.get.button(looper[key]);
        });
    }

    drawPlayDecoration(ctx = this.app.game.gui.controlsCtx) {
        const card = {
            x: 10,
            y: this.app.stats.isShowing ? app.gui.ctx.canvas.height - 200 : 10,
        }

        const {
            color,
            font,
            anthillAnts,
            anthillFood,
            antSelected,
            pickedBarText,
            energyText,
            entity
        } = this.#getPlayDataStrings();

        // CALCULATE MAX CONTENT WIDTH FROM ALL ELEMENTS
        const width = this.app.tools.max([
            ctx.measureText(antSelected).width,
            240
        ]);
        // DATA BACKGROUND
        this.app.gui.get.square({
            ctx: this.app.game.gui.controlsCtx,
            x: card.x,
            y: card.y,
            width: width + 35,
            height: 225,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });
        // PLAYER ENTITY
        this.app.gui.get.text({
            ctx, font, color, text: antSelected, x: card.x + 15, y: card.y + 30,
        });
        // FOOD BAR
        this.app.gui.get.bar({
            ctx,
            x: card.x + 15,
            y: card.y + 60,
            text: pickedBarText,
            cap: 220,
            fill: (entity?.pickedFood ?? 0) / 220,
            fillColor: 'green-red',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);
        // ENERGY BAR
        this.app.gui.get.bar({
            ctx,
            x: card.x + 15,
            y: card.y + 100,
            text: energyText,
            cap: 220,
            fill: (entity?.energy ?? 0) / 220,
            fillColor: 'red-green',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);
        // BACKGROUND
        this.app.gui.ctx.canvas.style.backgroundColor = 'rgb(200,200,200)';

        // Width Selector
        this.hoverCollection.widthSelector = {
            x: card.x + 100,
            y: card.y + 130,
            width: 40,
            height: 20,
        }

        this.app.gui.get.square({
            ctx,
            ...this.hoverCollection.widthSelector,
            color: 'rgba(150,150,150, 0.5)',
            stroke: 'rgba(0, 0, 0, 0.5)'
        });

        this.app.gui.get.text({
            ctx, color, text: `Width: ${this.app.game.level.size.width}`, x: card.x + 25, y: card.y + 145,
        });

        this.app.gui.get.square({
            ctx,
            ...this.hoverCollection.widthSelector,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });

        // Height Selector
        this.hoverCollection.heightSelector = {
            x: card.x + 100,
            y: card.y + 160,
            width: 40,
            height: 20
        }

        this.app.gui.get.square({
            ctx,
            ...this.hoverCollection.heightSelector,
            color: 'rgba(150,150,150, 0.5)',
            stroke: 'rgba(0, 0, 0, 0.5)'
        });

        this.app.gui.get.text({
            ctx, color, text: `Hover: ${this.app.game.level.size.height}`, x: card.x + 25, y: card.y + 175,
        });

        this.app.gui.get.square({
            ctx,
            ...this.hoverCollection.heightSelector,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });

    }

    drawPlayControls(ctx = this.app.game.gui.controlsCtx) {
        const looper = {
            createAnt: {ctx, ...this.buttonsCollection.play.anthillControls.createAnt}
        }

        Object.keys(looper).forEach(key => {
            this.app.gui.get.button(looper[key]);
        });
    }

    /**
     * Draw and Update methods
     */
    update() {
        if (this.app.game.state.state === PLAY && this.app.game.level) {
            this.#updatePlayControlsData();
            this.#updatePlayCamera();
        }
        if (this.app.game.state.state === MAIN_MENU) {
            this.#updateMainMenuData();
        }
    }

    draw() {
        // MAIN MENU SCREEN ELEMENTS
        if (this.app.game.state.state === MAIN_MENU) {
            this.drawMainMenuScreen();
        }

        // PLAY GAME LEVEL CONTROLS SCREEN ELEMENTS
        if (
            this.app.game.state.state === PLAY ||
            this.app.game.state.state === GAME_OVER &&
            this.app.game.level
        ) {
            this.drawPlayScreen();
        }
    }
}