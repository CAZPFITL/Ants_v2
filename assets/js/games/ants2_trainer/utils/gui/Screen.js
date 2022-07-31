import {PLAY, MAIN_MENU, GAME_OVER} from "../../env.js";

export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.hoverCollection = {};
        this.buttons = {
            play: {
                creatingAnt: false,
                creatingAnthill: false,
                resizingW: false,
                resizingH: false
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
                    'createAnt': {},
                    'createAnthill': {}
                },
                boardControls: {
                    'width': {},
                    'height': {}
                }
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
        this.app.controls.pushListener('mousemove', (e) => {
            const hoverTranslatedCoords = this.app.gui.get.viewportCoords({
                x: e.offsetX,
                y: e.offsetY
            }, this.app.camera.viewport);

            // CREATING ANTHILL PROCESS
            if (this.buttons.play.creatingAnthill) {
                this.creation.coords = hoverTranslatedCoords;
                this.creation.color = 'rgba(56,24,1,0.57)';
            }

            // DRAG RESIZE WIDTH
            if (this.buttons.play.resizingW) {
                this.app.game.level.size.width += e.movementX;
                this.app.game.level.coords.x = -this.app.game.level.size.width / 2 ?? 100;
            }
            // DRAG RESIZE HEIGHT
            if (this.buttons.play.resizingH) {
                this.app.game.level.size.height += e.movementX;
                this.app.game.level.coords.y = -this.app.game.level.size.height / 2 ?? 100;
            }
            // HOVER COLLECTION
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
            const clickTranslatedCoords = this.app.gui.get.viewportCoords({
                x: e.offsetX,
                y: e.offsetY
            }, this.app.camera.viewport);
            // Create Ant
            if (this.app.player.anthill) {
                this.app.gui.get.isClicked(
                    this.buttonsCollection.play.anthillControls.createAnt,
                    {x: e.offsetX, y: e.offsetY},
                    () => this.app.player.anthill.addAnt()
                )
            }
            // Change Width board size
            if (!this.buttons.play.creatingAnthill) {
                this.app.gui.get.isClicked(
                    this.buttonsCollection.play.anthillControls.createAnthill,
                    {x: e.offsetX, y: e.offsetY},
                    () => {
                        this.buttons.play.creatingAnthill = true;
                        this.app.game.level.loadAnthill(0, false);
                        this.creation = this.app.factory.binnacle.Anthill[this.app.factory.binnacle.Anthill.length - 1];
                    }
                )
            } else {
                if(this.app.gui.get.isHover({
                        ...this.app.game.level.coords,
                        ...this.app.game.level.size,
                    },
                    this.app.gui.get.viewportCoords({
                        x: e.offsetX,
                        y: e.offsetY
                    }, this.app.camera.viewport)
                )) {
                    this.buttons.play.creatingAnthill = false;
                    this.creation.color = 'rgba(56,24,1,1)';
                }
            }
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
            this.buttons.play.resizingW = false
            this.buttons.play.resizingH = false
            this.buttons.play.creatingAnt = false
            // this.buttons.play.creatingAnthill = false
        });
        this.app.controls.pushListener('mousedown', (e) => {
            // Change Width board size
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.boardControls.width,
                {x: e.offsetX, y: e.offsetY},
                () => this.buttons.play.resizingW = true

            )
            // Change Height board size
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.boardControls.height,
                {x: e.offsetX, y: e.offsetY},
                () => this.buttons.play.resizingH = true
            )
            // Create ant down
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.anthillControls.createAnt,
                {x: e.offsetX, y: e.offsetY},
                () => (this.app.player.anthill) && (this.buttons.play.creatingAnt = true)
            )
        });
    }


    #getPlayDataStrings() {
        // TODO consider to make multiple anthills
        let antHill = this.app.factory.binnacle?.Anthill
        const entity = this.app.player.ant

        antHill = (antHill instanceof Array) ? antHill[0] : {};

        const dec = this.app.tools.xDec
        const {ants, food, player} = {
            ants: antHill?.antCounter ?? "n/a",
            food: dec(antHill?.food ?? 0, 0),
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
            },
            'createAnthill': {
                x: this.gui.controlsCtx.canvas.width - 120,
                y: 10,
                width: 50,
                height: 50,
                text: '🐝',
                font,
                bg: !this.buttons.play.creatingAnthill ? '#b47607' : '#ffa600'
            }
        }
        this.buttonsCollection.play.boardControls = {
            'width': {
                x: 107.5,
                y: 150,
                width: 125,
                height: 20,
                text: '< * >',
                font,
                bg: this.buttons.play.resizingW ? '#ffa600' : '#b47607'
            },
            'height': {
                x: 107.5,
                y: 180,
                width: 125,
                height: 20,
                text: '< * >',
                font,
                bg: this.buttons.play.resizingH ? '#ffa600' : '#b47607'
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
            font: "62px Mouse",
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
            color: 'rgba(148,255,0,0.32)',
            stroke: '#000'
        });
        // PLAYER ENTITY
        this.app.gui.get.text({
            ctx,
            font,
            color,
            text: antSelected,
            x: card.x + 15,
            y: card.y + 30,
        });
        // FOOD BAR
        this.app.gui.get.bar({
            ctx,
            x: card.x + 15,
            y: card.y + 65,
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
            y: card.y + 65 + 40,
            text: energyText,
            cap: 220,
            fill: (entity?.energy ?? 0) / 220,
            fillColor: 'red-green',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);
        // BACKGROUND
        this.app.gui.ctx.canvas.style.backgroundColor = 'rgb(200,200,200)';

        //SIZE SELECTORS
        const sizes = {
            x: card.x + 15,
            y: card.y + 130,
            width: 220,
            height: 70,
        }

        this.app.gui.get.square({
            ctx,
            ...sizes,
            color: 'rgba(80,62,50,0.75)',
            stroke: 'rgb(0,0,0)'
        });

        // Width Selector
        this.hoverCollection.widthSelector = this.buttonsCollection.play.boardControls.width;

        this.app.gui.get.text({
            ctx,
            color,
            text: `Width: ${this.app.game.level.size.width}`,
            x: sizes.x + card.x + 0,
            y: sizes.y + card.y + 15,
        });

        // Height Selector
        this.hoverCollection.heightSelector = this.buttonsCollection.play.boardControls.height;

        this.app.gui.get.text({
            ctx,
            color,
            text: `Height: ${this.app.game.level.size.height}`,
            x: sizes.x + card.x + 0,
            y: sizes.y + card.y + 45,
        });
    }

    drawPlayControls(ctx = this.app.game.gui.controlsCtx) {
        const looper = {
            createAnt: this.app.player.anthill ? {ctx, ...this.buttonsCollection.play.anthillControls.createAnt} : {},
            createAnthill: {ctx, ...this.buttonsCollection.play.anthillControls.createAnthill},
            width: {ctx, ...this.buttonsCollection.play.boardControls.width},
            height: {ctx, ...this.buttonsCollection.play.boardControls.height}
        }

        Object.keys(looper).forEach(key => {
            if (Object.keys(looper[key]).length > 0) {
                this.app.gui.get.button(looper[key]);
            }

            this.hoverCollection[key] = {
                x: looper[key].x,
                y: looper[key].y,
                width: looper[key].width,
                height: looper[key].height
            }
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