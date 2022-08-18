import {PLAY, MAIN_MENU, GAME_OVER, COLORS} from "../../env.js";

export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.hoverCollection = {};
        this.decorations = {};
        this.buttonsStates = {};
        this.buttonsCollection = {};
        this.colors = {};
        this.#addListeners();
    }

    /**
     * Private methods
     */
    #addListeners() {
        this.app.controls.pushListener(this, 'mousemove', (event) => {
            // HOVER COLLECTION
            this.app.gui.get.checkHoverCollection({
                collection: this.hoverCollection,
                event,
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
        this.app.controls.pushListener(this, 'mouseup', (event) => {
            const coords = {x: event.offsetX, y: event.offsetY};
            const viewportCtx = this.app.gui.get.clickCoords(event, this.app.camera.viewport);
            const buttons = {
                forward: {coords, ...this.buttonsCollection.PLAY.forward},
                reverse: {coords, ...this.buttonsCollection.PLAY.reverse},
                left: {coords, ...this.buttonsCollection.PLAY.left},
                right: {coords, ...this.buttonsCollection.PLAY.right},
                eat: {coords, ...this.buttonsCollection.PLAY.eat},
                pick: {coords, ...this.buttonsCollection.PLAY.pick},
                start: {coords: viewportCtx, ...this.buttonsCollection.MAIN_MENU.start}
            }
            Object.keys(buttons).forEach(key => {
                this.app.gui.get.isClicked(
                    buttons[key].props,
                    buttons[key].coords,
                    () => {
                        this.buttonsStates[key] = 'normal';
                        buttons[key].props?.callbacks?.mouseup && buttons[key].props.callbacks.mouseup();
                    }
                )
            });
            this.buttonsStates.creatingAnt = 'normal';
            this.buttonsStates.creatingAnthill = 'normal';
        });
        this.app.controls.pushListener(this, 'mousedown', (event) => {
            const coords = {x: event.offsetX, y: event.offsetY};
            const viewportCoords = this.app.gui.get.clickCoords(event, this.app.camera.viewport);
            const buttons = {
                forward: {coords, ...this.buttonsCollection.PLAY.forward},
                reverse: {coords, ...this.buttonsCollection.PLAY.reverse,},
                left: {coords, ...this.buttonsCollection.PLAY.left},
                right: {coords, ...this.buttonsCollection.PLAY.right},
                eat: {coords, ...this.buttonsCollection.PLAY.eat},
                pick: {coords, ...this.buttonsCollection.PLAY.pick},
                start: {coords: viewportCoords, ...this.buttonsCollection.MAIN_MENU.start}
            }
            Object.keys(buttons).forEach(key => {
                this.app.gui.get.isClicked(
                    buttons[key].props,
                    buttons[key].coords,
                    () => {
                        this.buttonsStates[key] = 'click';
                        buttons[key].props?.callbacks?.mousedown && buttons[key].props.callbacks.mousedown();
                    }
                )
            });
        });
        this.app.controls.pushListener(this, 'click', (event) => {
            const coords = {x: event.offsetX, y: event.offsetY};
            const buttons = {
                sound: {coords,...this.buttonsCollection.PLAY.sound},
                createAnt: {coords,...this.buttonsCollection.PLAY.createAnt},
                createAnthill: {coords,...this.buttonsCollection.PLAY.createAnthill},
            }
            Object.keys(buttons).forEach(key => {
                this.app.gui.get.isClicked(
                    buttons[key].props,
                    buttons[key].coords,
                    () => {
                        this.buttonsStates[key] = this.buttonsStates[key] === 'click' ? 'normal' : 'click';
                        buttons[key].props?.callbacks?.click && buttons[key].props.callbacks.click();
                    }
                )
            });
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

        const height = 190;
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
                        widthStroke: 8,
                        callbacks: {
                            mouseup: () => {
                                this.app.game.state.setState(PLAY);
                                this.app.musicBox.play();
                            }
                        }
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
                        bg: this.buttonsStates.login === 'hover' ? COLORS.BLACK[5]
                            : this.buttonsStates.login === 'click' ? COLORS.BLACK[5]
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
                        bg: this.buttonsStates.forward === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.forward === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => this.app.player.controls.forward = 1,
                            mouseup: () => this.app.player.controls.forward = 0
                        },
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
                        bg: this.buttonsStates.reverse === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.reverse === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => this.app.player.controls.reverse = 1,
                            mouseup: () => this.app.player.controls.reverse = 0
                        },
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
                        bg: this.buttonsStates.left === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.left === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => this.app.player.controls.left = 1,
                            mouseup: () => this.app.player.controls.left = 0
                        },
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
                        bg: this.buttonsStates.right === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.right === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => this.app.player.controls.right = 1,
                            mouseup: () => this.app.player.controls.right = 0
                        },
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
                        bg: this.buttonsStates.pick === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.pick === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => this.app.player.controls.pick = 1,
                            mouseup: () => this.app.player.controls.pick = 0
                        },
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
                        bg: this.buttonsStates.eat === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.eat === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => this.app.player.controls.eat = 1,
                            mouseup: () => this.app.player.controls.eat = 0
                        },
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
                        bg: this.buttonsStates.createAnt === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.createAnt === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => this.app.player.anthill.addAnt()
                        }
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
                        bg: this.buttonsStates.createAnthill === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.createAnthill === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => console.log('create anthill')
                        }
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
                        bg: this.buttonsStates.sound === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.sound === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => this.app.musicBox.song.song.volume = !this.app.musicBox.song.song.volume
                        }
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
                        height,
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

        (this.app.player?.followCamera && this.app.player.ant.speed !== 0) &&
            this.app.camera.follow(this.app.player.ant);
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
            if (this.app.gui.get[item.type]) this.app.gui.get[item.type](item.props);
        }
        // HOVER EVENTS
        Object.entries(this.buttonsCollection[this.app.game.state.state] ?? {}).forEach(key => {
            this.hoverCollection[key[0]] = key[1].props;
        });
        // CANVAS BACKGROUND
        this.app.gui.ctx.canvas.style.backgroundColor = this.colors[this.app.game.state.state].background;
    }
}