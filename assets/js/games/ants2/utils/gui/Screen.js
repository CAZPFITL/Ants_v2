import {PLAY, MAIN_MENU, GAME_OVER, COLORS} from "../../env.js";

export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.hoverCollection = {};
        this.decorations = {};
        this.buttonsStates = {
            'start': 'normal',
        };
        this.buttonsCollection = {}
        this.colors = {}
        this.#addListeners();
    }

    /**
     * Private methods
     */
    #addListeners() {
        this.app.controls.pushListener(this, 'mousemove', (e) => {
            // HOVER COLLECTION
            this.app.gui.get.checkHoverCollection({
                collection: this.hoverCollection,
                event: e,
                viewport: this.app.camera.viewport,
                isHover: (key) => {
                    (this.buttonsStates[key] !== 'click') && (this.buttonsStates[key] = 'hover');
                    this.hoverCaller = key;
                    this.gui.hoverStateIn();
                },
                isOut: (key) => {
                    (this.buttonsStates[key] !== 'click') && (this.buttonsStates[key] = 'normal');
                    this.hoverCaller = null;
                    this.gui.hoverStateOut();
                },
                caller: this.hoverCaller,
            });
        });
        this.app.controls.pushListener(this, 'click', (e) => {
            if (this.app.player.anthill) {
                // Create Ant
                this.app.gui.get.isClicked(
                    this.buttonsCollection.PLAY.createAnt,
                    {x: e.offsetX, y: e.offsetY},
                    () => this.app.player.anthill.addAnt()
                )
            }
            // Picking on/off
            this.app.gui.get.isClicked(
                this.buttonsCollection.PLAY.pick,
                {x: e.offsetX, y: e.offsetY},
                () => {
                    this.app.player.controls.pick = Number(!this.app.player.controls.pick);
                }
            )
            // Eating on/off
            this.app.gui.get.isClicked(
                this.buttonsCollection.PLAY.eat,
                {x: e.offsetX, y: e.offsetY},
                () => {
                    this.app.player.controls.eat = Number(!this.app.player.controls.eat);
                }
            )
            // Sound on/off
            this.app.gui.get.isClicked(
                this.buttonsCollection.PLAY.sound,
                {x: e.offsetX, y: e.offsetY},
                (volume = this.app.musicBox.song.song.volume) => {
                    this.app.musicBox.song.song.volume = !volume
                    this.buttons.play.sound = !this.buttons.play.sound
                }
            )
        });
        this.app.controls.pushListener(this, 'mouseup', (e) => {
            // Start Game
            this.app.gui.get.isClicked(
                this.buttonsCollection.MAIN_MENU.start.props,
                this.app.gui.get.clickCoords(e, this.app.camera.viewport),
                () => {
                    // this.buttons.main_menu.start = false;
                    this.app.game.state.setState(PLAY);
                    this.app.musicBox.play();
                }
            );
            this.buttons.play.creatingAnt = false
            this.buttons.play.creatingAnthill = false
        });
        this.app.controls.pushListener(this, 'mousedown', (e) => {
            // // Show fps
            // (e.which === 2) && this.app.gui.get.isClicked(
            //     {
            //         x: 0,
            //         y: 0,
            //         width: this.app.gui.ctx.canvas.width,
            //         height: this.app.gui.ctx.canvas.height
            //     },
            //     {x: e.offsetX, y: e.offsetY},
            //     () => this.app.toggleStats()
            // );
            // // Create ant down
            // if (this.app.player.anthill) {
            //     this.app.gui.get.isClicked(
            //         this.buttonsCollection.play.anthillControls.createAnt,
            //         {x: e.offsetX, y: e.offsetY},
            //         () => this.buttons.play.creatingAnt = true
            //
            //     )
            // }
            // // Create anthill down
            // this.app.gui.get.isClicked(
            //     this.buttonsCollection.play.anthillControls.createAnthill,
            //     {x: e.offsetX, y: e.offsetY},
            //     () => this.buttons.play.creatingAnthill = true
            // )
        });
    }

    #getPlayDataStrings() {
        let antHill = this.app.factory.binnacle?.Anthill
        const ant = this.app.player?.ant
        const anthill = this.app.player?.anthill

        antHill = (antHill instanceof Array) ? antHill : {};

        const dec = this.app.tools.xDec
        const {ants, food, player} = {
            ants: antHill?.antCounter ?? "n/a",
            food: dec(antHill?.food ?? 0, 0),
            player: {
                name: `Ant #${ant?.id ?? 'N/A'} Anthill #${anthill?.id ?? 'N/A'}`,
                energy: dec((ant?.energy ?? 1) * 10, 2) ?? 0,
                maxFoodPickCapacity: ant?.maxFoodPickCapacity ?? 100,
                maxPickedFood: ant?.maxPickedFood ?? 0,
                pickedFood: ant?.pickedFood ?? 0,
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
            entity: ant
        }
    }

    /**
     * Draw and Update methods
     */
    update() {
        const cardPosition = {
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
            this.app.game.gui.controlsCtx.measureText(antSelected).width,
            240
        ]);

        this.colors = {
            MAIN_MENU: {
                background: COLORS.GREEN[0],
                buttons: {
                    variation1: {
                        hover: COLORS.YELLOW[2],
                        click: COLORS.YELLOW[0],
                        normal: COLORS.YELLOW[1],
                        stroke: COLORS.BLACK[0],
                    }
                },
                mainCard: {
                    text: COLORS.WHITE[0],
                    background: COLORS.BROWN[0],
                    color: COLORS.BLACK[0],
                }
            },
            PLAY: {
                background: COLORS.GREEN[0],
            }
        };
        this.buttonsCollection = {
            MAIN_MENU: {
                start: {
                    type: 'button',
                    props: {
                        position: 'viewport',
                        ctx: this.app.gui.ctx,
                        x: -150,
                        y: -20,
                        width: 300,
                        height: 50,
                        text: 'Start',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 8
                    }
                },
                login: {
                    type: 'button',
                    props: {
                        position: 'viewport',
                        ctx: this.app.gui.ctx,
                        x: -150,
                        y: 70,
                        width: 300,
                        height: 50,
                        text: 'Login',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? COLORS.BLACK[5]
                            : this.buttonsStates.start === 'click' ? COLORS.BLACK[5]
                                : COLORS.BLACK[6],
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 8
                    }
                }
            },
            PLAY: {
                forward: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 120,
                        y: this.gui.controlsCtx.canvas.height - 120,
                        width: 50,
                        height: 50,
                        text: '↑',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                reverse: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 120,
                        y: this.gui.controlsCtx.canvas.height - 60,
                        width: 50,
                        height: 50,
                        text: '↓️',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                left: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 180,
                        y: this.gui.controlsCtx.canvas.height - 60,
                        width: 50,
                        height: 50,
                        text: '←',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                right: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 60,
                        y: this.gui.controlsCtx.canvas.height - 60,
                        width: 50,
                        height: 50,
                        text: '→️',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                createAnt: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 60,
                        y: 10,
                        width: 50,
                        height: 50,
                        text: '🐜',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                createAnthill: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 120,
                        y: 10,
                        width: 50,
                        height: 50,
                        text: '🐝',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                pick: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 60,
                        y: 70,
                        width: 50,
                        height: 50,
                        text: '🚚',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                eat: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 60,
                        y: 130,
                        width: 50,
                        height: 50,
                        text: '🍏',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
                sound: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 60,
                        y: 190,
                        width: 50,
                        height: 50,
                        text: '🔈',
                        font: '16px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2
                    }
                },
            }
        };
        this.decorations = {
            MAIN_MENU: {
                main_card: {
                    type: 'square',
                    props: {
                        ctx: this.app.gui.ctx,
                        x: -300,
                        y: -200,
                        width: 600,
                        height: 400,
                        color: this.colors.MAIN_MENU.mainCard.background,
                        stroke: this.colors.MAIN_MENU.mainCard.color,
                        widthStroke: 5
                    }
                },
                title: {
                    type: 'text',
                    props: {
                        ctx: this.app.gui.ctx,
                        font: '72px Mouse',
                        text: this.app.game.constructor.name,
                        x: -300,
                        y: -100,
                        color: this.colors.MAIN_MENU.mainCard.text,
                        width: 600,
                        height: 30,
                        center: true
                    }
                }
            },
            PLAY: {
                data_card: {
                    type: 'square',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        x: cardPosition.x,
                        y: cardPosition.y,
                        width: width + 35,
                        height: 190,
                        color: COLORS.WHITE[4],
                        stroke: COLORS.BLACK[0]
                    }
                },
                player_entity: {
                    type: 'text',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        font,
                        color,
                        text:
                        antSelected,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 30,
                    }
                },
                anthill_data: {
                    type: 'text',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        font,
                        color,
                        text: anthillAnts,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 60,
                    }
                },
                food_data: {
                    type: 'text',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        font,
                        color,
                        text: anthillFood,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 90,
                    }
                },
                food_bar: {
                    type: 'bar',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 125,
                        text: pickedBarText,
                        // cap: (entity?.maxFoodPickCapacity ?? 10) * 10,
                        cap: 245,
                        fill: (entity?.pickedFood ?? 1) / (entity?.maxFoodPickCapacity ?? 10) * 245,
                        fillColor: 'green-red',
                        barColor: COLORS.BLACK[6],
                        stroke: COLORS.BLACK[0],
                        negative: false,
                    }
                },
                energy_bar: {
                    type: 'bar',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 165,
                        text: energyText,
                        cap: 245,
                        fill: entity?.energy / 100 * 245,
                        fillColor: 'red-green',
                        barColor: COLORS.BLACK[6],
                        stroke: COLORS.BLACK[0],
                        negative: false,
                    }
                },
                antCounter: {
                    type: 'text',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        font,
                        text: `${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`,
                        x: 10,
                        y: window.innerHeight - 10,
                    }
                }
            }
        };

        // (this.app.player.followCamera && this.app.player.ant.speed !== 0) &&
        //     this.app.camera.follow(this.app.player.ant);
    }

    draw() {
        // DECLARE COLLECTION
        const collection = [
            ...Object.values(this.decorations[this.app.game.state.state] ?? {}),
            ...Object.values(this.buttonsCollection[this.app.game.state.state] ?? {}),
        ];
        // DRAW COLLECTION
        for (let i = 0; i < collection.length; i++) {
            const item = collection[i];
            this.app.gui.get[item.type](item.props);
        }
        // HOVER EVENTS
        Object.entries(this.buttonsCollection[this.app.game.state.state] ?? {}).forEach(key => {
            this.hoverCollection[key[0]] = key[1].props;
        });
        // CANVAS BACKGROUND
        this.app.gui.ctx.canvas.style.backgroundColor =
            this.colors[this.app.game.state.state].background;
    }
}