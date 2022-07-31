import {PLAY, MAIN_MENU, GAME_OVER} from "../../env.js";

export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.buttons = {
            play: {
                pick: false,
                creatingAnt: false,
                sound: false
            },
            main_menu: {
                start: false
            }
        }
        this.hoverCollection = {};
        this.buttonsCollection = {
            main_menu: {
                mainMenuControls: {
                    'start': {}
                }
            },
            play: {
                movementControls: {
                    'forward': {},
                    'reverse': {},
                    'left': {},
                    'right': {}
                },
                anthillControls: {
                    'createAnt': {}
                },
                antControls: {
                    'pick': {},
                    'eat': {}
                },
                gameControls: {
                    'sound': {}
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
                ()=> this.app.player.anthill.addAnt()
            )
            // Picking on/off
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.antControls.pick,
                {x: e.offsetX, y: e.offsetY},
                ()=> {
                    this.app.player.controls.pick = Number(!this.app.player.controls.pick);
                }
            )
            // Eating on/off
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.antControls.eat,
                {x: e.offsetX, y: e.offsetY},
                ()=> {
                    this.app.player.controls.eat = Number(!this.app.player.controls.eat);
                }
            )
            // Sound on/off
            this.app.gui.get.isClicked(
                this.buttonsCollection.play.gameControls.sound,
                {x: e.offsetX, y: e.offsetY},
                (volume = this.app.musicBox.song.song.volume)=> {
                    this.app.musicBox.song.song.volume = !volume
                    this.buttons.play.sound = !this.buttons.play.sound
                }
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
                    this.app.musicBox.play();
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
            anthillAnts: `Anthill Ants: ${ants}`,
            anthillFood: `Anthill Food: ${food}`,
            antSelected: `Player: ${player.name}`,
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
        this.buttonsCollection.play.movementControls = {
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
        this.buttonsCollection.play.antControls = {
            'pick': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 70,
                width: 50,
                height: 50,
                text: '🚚',
                font,
                bg: !this.buttons.play.pick ? '#b47607' : '#ffa600'
            },
            'eat': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 130,
                width: 50,
                height: 50,
                text: '🍏',
                font,
                bg: !this.buttons.play.eat ? '#b47607' : '#ffa600'
            }
        }
        this.buttonsCollection.play.gameControls = {
            'sound': {
                x: this.gui.controlsCtx.canvas.width - 60,
                y: 190,
                width: 50,
                height: 50,
                text: '🔈',
                font,
                bg: this.buttons.play.sound ? '#b47607' : '#ffa600'
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

    drawPlayDecoration() {
        const ctx = this.app.game.gui.controlsCtx;
        const cardPosition = {
            x: 10,
            y: this.app.stats.isShowing ? app.gui.ctx.canvas1.height - 200 : 10,
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
            x: cardPosition.x,
            y: cardPosition.y,
            width: width + 35,
            height: 190,
            color: 'rgba(255, 255, 255, 0.2)',
            stroke: '#000'
        });

        // PLAYER ENTITY
        this.app.gui.get.text({
            ctx,
            font,
            color,
            text:
            antSelected,
            x: cardPosition.x + 15,
            y: cardPosition.y + 30,
        });

        // ANTHILL DATA
        this.app.gui.get.text({
            ctx,
            font,
            color,
            text: anthillAnts,
            x: cardPosition.x + 15,
            y: cardPosition.y + 60,
        });

        // FOOD DATA
        this.app.gui.get.text({
            ctx,
            font,
            color,
            text: anthillFood,
            x: cardPosition.x + 15,
            y: cardPosition.y + 90,
        });

        // FOOD BAR
        this.app.gui.get.bar({
            ctx,
            x: cardPosition.x + 15,
            y: cardPosition.y + 125,
            text: pickedBarText,
            // cap: (entity?.maxFoodPickCapacity ?? 10) * 10,
            cap: 245,
            fill: (entity?.pickedFood ?? 1) / (entity?.maxFoodPickCapacity ?? 10) * 245,
            fillColor: 'green-red',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);

        // ENERGY BAR
        this.app.gui.get.bar({
            ctx,
            x: cardPosition.x + 15,
            y: cardPosition.y + 165,
            text: energyText,
            cap: 245,
            fill: entity?.energy / 100 * 245,
            fillColor: 'red-green',
            barColor: 'rgba(0,0,0,0.5)',
            stroke: '#000'
        }, false);

        this.app.gui.ctx.canvas.style.backgroundColor = 'rgb(130,169,30)';
    }

    drawPlayControls() {
        const ctx = this.app.game.gui.controlsCtx;

        const looper = {
            forward: {ctx, ...this.buttonsCollection.play.movementControls.forward},
            reverse: {ctx, ...this.buttonsCollection.play.movementControls.reverse},
            left: {ctx, ...this.buttonsCollection.play.movementControls.left},
            right: {ctx, ...this.buttonsCollection.play.movementControls.right},
            pick: {ctx, ...this.buttonsCollection.play.antControls.pick},
            eat: {ctx, ...this.buttonsCollection.play.antControls.eat},
            createAnt: {ctx, ...this.buttonsCollection.play.anthillControls.createAnt},
            sound: {ctx, ...this.buttonsCollection.play.gameControls.sound},
        }

        Object.keys(looper).forEach(key => {
            this.app.gui.get.button(looper[key]);

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