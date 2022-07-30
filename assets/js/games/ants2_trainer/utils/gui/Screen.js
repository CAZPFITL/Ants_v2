import {PLAY, MAIN_MENU, GAME_OVER} from "../../env.js";

export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
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
        this.app.controls.pushListener('click', (e) => {
            // Create Ant
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.anthillControls.createAnt,
                {x: e.offsetX, y: e.offsetY},
                ()=> this.app.player.anthill.addAnt()
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
        const antHill = this.app.factory.binnacle['Anthill'][0]
        const entity = this.app.player.ant

        if (!antHill || !entity) return

        const {ants, food, player} = {
            ants: antHill.antCounter ?? "n/a", food: this.app.tools.xDec(antHill.food, 0), player: {
                name: `Ant #${entity.id} Anthill #${entity.home.id}` ?? "No Ant Selected",
                energy: this.app.tools.xDec(entity.energy * 10, 2) ?? "n/a",
                maxFoodPickCapacity: entity.maxFoodPickCapacity ?? "n/a",
                maxPickedFood: entity.maxPickedFood ?? "n/a",
                pickedFood: entity.pickedFood ?? "n/a",
            }
        }

        return {
            color: '#000000',
            font: "20px Mouse",
            antSelected: `${player.name}`,
            pickedBarText: `Picked Food: ${this.app.tools.xDec(player.pickedFood, 0)} / ${this.app.tools.xDec(player.maxFoodPickCapacity, 0)}`,
            energyText: `Energy: ${this.app.tools.xDec(player.energy / 10, 0)} / ${100}`,
            entity
        }
    }

    #updateMainMenuData() {
        const font = "16px Mouse";
        this.buttonsCollection.main_menu.mainMenuControls = {
            'start': {
                x: -150,
                y: -20,
                width: 300,
                height: 50,
                text: 'Start',
                font,
                bg: !this.buttons.main_menu.start ? '#d28b05' : '#ffa600'
            },
            'login': {
                x: -150,
                y: 50,
                width: 300,
                height: 50,
                text: 'Login',
                font,
                bg: '#939393'
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

    drawPauseScreen() {

    }

    /**
     * Draw Decoration / Controls
     */
    drawMainMenuDecoration() {
        this.app.gui.get.square({
            ctx: this.app.gui.ctx,
            x: -300,
            y: -200,
            width: 600,
            height: 400,
            color: '#72604e',
            stroke: '#000000',
        });
        this.app.gui.get.text({
            ctx: this.app.gui.ctx,
            font: "72px Mouse",
            text: 'Ants',
            x: 0,
            y: -100,
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
            start: {ctx, ...this.buttonsCollection.main_menu.mainMenuControls.start},
            login: {ctx, ...this.buttonsCollection.main_menu.mainMenuControls.login}
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
            ctx.measureText(antSelected).width * 1.4,
            ctx.measureText(anthillFood).width * 1.4,
            ctx.measureText(anthillAnts).width * 1.4,
            ctx.measureText(pickedBarText).width * 1.4,
            entity.maxFoodPickCapacity * 10,
            100
        ]);
        // DATA BACKGROUND
        this.app.gui.get.square({
            ctx: this.app.game.gui.controlsCtx,
            x: card.x,
            y: card.y,
            width: width + 35,
            height: 125,
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
            cap: entity.maxFoodPickCapacity * 10,
            fill: entity.pickedFood * 10,
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
            cap: 100,
            fill: entity.energy,
            fillColor: 'red-green',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);

        this.app.gui.ctx.canvas.style.backgroundColor = 'rgb(130,169,30)';
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