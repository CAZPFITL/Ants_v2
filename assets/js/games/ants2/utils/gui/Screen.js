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
        this.#addListeners({
            mousemove: (e) => true,
            mouseup: (e) => true,
            mousedown: (e) => true,
            click: (e) => true,
        });
    }

    #addListeners(abstractEvents) {
        this.app.controls.pushListener(this, 'mousemove', (event) => {
            const buttons = this.#getButtons()
            const hoverTranslatedCoords = this.app.gui.get.viewportCoords({
                x: event.offsetX,
                y: event.offsetY
            }, this.app.camera.viewport);

            // ABSTRACT MOVE
            abstractEvents.mousemove(event, hoverTranslatedCoords);
            // MOUSE MOVE
            Object.keys(buttons).forEach((key) =>
                buttons[key].props?.callbacks?.mousemove &&
                buttons[key].props.callbacks.mousemove(event, hoverTranslatedCoords));
            // HOVER READ
            this.app.gui.get.checkHoverCollection({
                collection: this.hoverCollection,
                event,
                viewport: this.app.camera.viewport,
                isHover: (key) => {
                    if (this.buttonsStates[key] !== 'click' && this.buttonsStates[key] !== 'hover') {
                        this.buttonsStates[key] = 'hover';
                        this.hoverCaller = key;
                        this.gui.hoverStateIn();
                    }
                },
                isOut: (key) => {
                    if (this.buttonsStates[key] !== 'click' && this.buttonsStates[key] !== 'normal') {
                        this.buttonsStates[key] = 'normal';
                        this.hoverCaller = null;
                        this.gui.hoverStateOut();
                    }
                },
                caller: this.hoverCaller,
            });
        });
        this.app.controls.pushListener(this, 'mouseup', (event) => {
            const buttons = this.#getButtons()

            console.log(event)
            console.log(buttons)

            Object.keys(buttons).forEach((key) => {
                const ctx = buttons[key].props.position === 'viewport'
                    ? this.app.gui.get.clickCoords(event, this.app.camera.viewport)
                    : {x: event.offsetX, y: event.offsetY};

                this.app.gui.get.isClicked(
                    buttons[key].props,
                    ctx,
                    () => buttons[key].props?.callbacks?.mouseup && buttons[key].props.callbacks.mouseup(event)
                )
            });
            abstractEvents.mouseup(event);
        });
        this.app.controls.pushListener(this, 'mousedown', (event) => {
            const buttons = this.#getButtons()

            Object.keys(buttons).forEach((key) => {
                if (!buttons[key].props?.ctx) return;
                const ctx = buttons[key].props.position === 'viewport'
                    ? this.app.gui.get.clickCoords(event, this.app.camera.viewport)
                    : {x: event.offsetX, y: event.offsetY};

                this.app.gui.get.isClicked(
                    buttons[key].props,
                    ctx,
                    () => buttons[key].props?.callbacks?.mousedown && buttons[key].props.callbacks.mousedown(event)
                )
            });
            abstractEvents.mousedown(event);
        });
        this.app.controls.pushListener(this, 'click', (event) => {
            const buttons = this.#getButtons()

            Object.keys(buttons).forEach((key) => {
                const ctx = buttons[key].props.position === 'viewport'
                    ? this.app.gui.get.clickCoords(event, this.app.camera.viewport)
                    : {x: event.offsetX, y: event.offsetY};

                this.app.gui.get.isClicked(
                    buttons[key].props,
                    ctx,
                    () => buttons[key].props?.callbacks?.click && buttons[key].props.callbacks.click(event)
                )
            });

            abstractEvents.click(event);
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

    #getButtons() {
        const output = {};
        Object.entries(this.buttonsCollection).forEach(key => {
            if(key[0] !== this.app.game.state.state) return;
            Object.entries(key[1]).forEach(button => output[button[0]] = button[1]);
        })
        return output;
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
            try {
                const item = collection[i];
                if (typeof this.app.gui.get[item.type] === 'function') {
                    this.app.gui.get[item.type](item.props);
                }
            } catch (error) {
                console.error(
                    'verify item.props are provided with next keys:' +
                    'position, ctx, x, y, width, height, text, font, bg, stroke, widthStroke, callbacks' +
                    error
                );
                debugger;
            }
        }
        // CLEAR HOVER COLLECTION
        this.hoverCollection = {};
        // HOVER EVENTS
        Object.entries(this.buttonsCollection[this.app.game.state.state] ?? {}).forEach(key => {
            this.hoverCollection[key[0]] = key[1].props;
        });
        // CANVAS BACKGROUND
        this.app.gui.ctx.canvas.style.backgroundColor = this.colors[this.app.game.state.state].background;
    }
}