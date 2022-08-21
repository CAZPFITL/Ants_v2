import Traces from "./../../../ants2/utils/entities/Traces.js";
import Parser from "../../../../engine/utils/components/Parser.js";
import {
    PLAY,
    MAIN_MENU,
    GAME_OVER,
    NETWORK, COLORS
} from "../../../ants2/env.js";

// https://github.com/CAZPFITL/Ants_v2/blob/9ed65ec9c0d938772531936c120af9beb6799a49/assets/js/games/ants2_trainer/utils/gui/Screen.js#L311

export default class Screen {
    /**
     * @param app {object}
     * @param gui {object}
     */
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.hoverCollection = {};
        this.buttonsStates = {};
        this.buttonsCollection = {};
        this.abstractStates = {
            creating: false,
        }
        this.#addListeners({
            mousemove: (e, hoverTranslatedCoords) => {
                // CREATING ENTITY PROCESS
                if (this.abstractStates.creating) {
                    if (this.creation?.coords) {
                        (this.creation.coords = hoverTranslatedCoords);
                    } else {
                        this.creation.x = hoverTranslatedCoords?.x;
                        this.creation.y = hoverTranslatedCoords?.y;
                    }
                }

                //CREATING TRACE PROCESS (ONLY INSIDE THE MAP)
                if (this.buttonsStates.trace) {
                    const entity = {
                        x: (-this.app.game.level.size.width) / 2,
                        y: (-this.app.game.level.size.height) / 2,
                        width: this.app.game.level.size.width,
                        height: this.app.game.level.size.height
                    }
                    if (this.app.gui.get.isHover(entity, hoverTranslatedCoords) && this.app.factory.binnacle['Traces'][0]) {
                        this.app.factory.binnacle['Traces'][0].markTrace(hoverTranslatedCoords);
                    }
                }
            },
            mouseup: (e) => {
                console.log('abstract mouseup event registered');
            },
            mousedown: (e) => {
                console.log('abstract mousedown event registered');
            },
            click: (e) => {
                console.log('abstract click event registered');
            },
            keyup: (e) => {
                console.log('abstract onkeyup event registered');
            },
            keydown: (e) => {
                console.log('abstract onkeydown event registered');
            }
        });
    }

    #addListeners(abstractEvents) {
        this.app.controls.pushListener(this, 'mousemove', (e) => {
            // TRANSLATE COORDS - general process
            const hoverTranslatedCoords = this.app.gui.get.viewportCoords({
                x: e.offsetX,
                y: e.offsetY
            }, this.app.camera.viewport);

            // CHECK COLLECTION
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
            abstractEvents.mousemove(e, hoverTranslatedCoords);
        });
        this.app.controls.pushListener(this, 'mouseup', (e) => {
            const coords = {x: event.offsetX, y: event.offsetY};
            const viewportCoords = this.app.gui.get.clickCoords(event, this.app.camera.viewport);
            const _buttons = {
                forward: {coords, ...this.buttonsCollection.PLAY.forward},
                start: {coords: viewportCoords, ...this.buttonsCollection.MAIN_MENU.start}
            }
            Object.keys(_buttons).forEach(key => {
                this.app.gui.get.isClicked(
                    _buttons[key].props,
                    _buttons[key].coords,
                    () => {
                        this.buttonsStates[key] = 'normal';
                        _buttons[key].props?.callbacks?.mouseup && _buttons[key].props.callbacks.mouseup();
                    }
                )
            });
            abstractEvents.mouseup(e);
        });
        this.app.controls.pushListener(this, 'mousedown', (event) => {
            const coords = {x: event.offsetX, y: event.offsetY};
            const viewportCoords = this.app.gui.get.clickCoords(event, this.app.camera.viewport);
            const _buttons = {
                forward: {coords, ...this.buttonsCollection.PLAY.forward},
                start: {coords: viewportCoords, ...this.buttonsCollection.MAIN_MENU.start}
            }
            Object.keys(_buttons).forEach(key => {
                this.app.gui.get.isClicked(
                    _buttons[key].props,
                    _buttons[key].coords,
                    () => {
                        this.buttonsStates[key] = 'click';
                        _buttons[key].props?.callbacks?.mousedown && _buttons[key].props.callbacks.mousedown();
                    }
                )
            });
            abstractEvents.mousedown(event);
        });
        this.app.controls.pushListener(this, 'keydown', (event) => {
            abstractEvents.keydown(event);
        });
        this.app.controls.pushListener(this, 'keyup', (event) => {
            abstractEvents.keyup(event);
        });
    }

    #getPlayDataStrings() {
        const ant = this.app.player?.ant
        const anthill = this.app.player?.anthill

        const dec = this.app.tools.xDec

        const player = {
            name: `Ant #${ant?.id ?? 'N/A'} Anthill #${anthill?.id ?? 'N/A'}`,
            energy: dec((ant?.energy ?? 1) * 10, 2) ?? 0,
            maxFoodPickCapacity: ant?.maxFoodPickCapacity ?? 100,
            maxPickedFood: ant?.maxPickedFood ?? 0,
            pickedFood: ant?.pickedFood ?? 0
        }

        return {
            color: '#000000',
            font: "20px Mouse",
            antSelected: `${player.name}`,
            pickedBarText: `Picked Food: ${dec(player.pickedFood, 0)} / ${dec(player.maxFoodPickCapacity, 0)}`,
            energyText: `Energy: ${dec(player.energy / 10, 0)} / ${100}`,
            entity: ant
        }
    }

    update() {
        const isAnthillIn = Boolean(this.app.factory.binnacle?.Anthill?.length)

        const useControlsCtx = this.app.game.state.state === PLAY
            || this.app.game.state.state === GAME_OVER
            || this.app.game.state.state === NETWORK
            && this.app.game.level;

        const ctx = (useControlsCtx) ? this.app.game.gui.controlsCtx : this.app.gui.ctx;

        const cardPosition = {
            x: 10,
            y: this.app.stats.isShowing ? app.gui.ctx.canvas.height - 200 : 10,
        }

        const {
            color,
            font,
            antSelected,
            pickedBarText,
            energyText,
            entity
        } = this.#getPlayDataStrings();

        const height = 360;
        const width = this.app.tools.max([
            ctx.measureText(antSelected).width * 2,
            240
        ]) + 10;

        this.colors = {
            MAIN_MENU: {
                background: COLORS.WHITE[0],
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
                background: COLORS.WHITE[0],
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
                        font: '18px Mouse',
                        bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 8,
                        callbacks: {
                            mouseup: () => {
                                this.buttonsStates.start = 'normal';
                                this.app.game.state.setState(PLAY);
                                this.gui.hoverStateOut();
                            }
                        }
                    }
                },
            },
            PLAY: {
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
                        text: '🏠',
                        font: '16px Mouse',
                        bg: this.buttonsStates.createAnthill === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.createAnthill === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => {
                                if (!this.buttonsStates.PLAY.createTrace && !this.buttonsStates.PLAY.loop) {
                                    this.abstractStates.creating = true;
                                    this.buttonsStates.PLAY.createAnthill = true;
                                    this.app.game.level.Anthill({ants: 0, free: true});
                                    this.creation = this.app.factory.binnacle.Anthill[this.app.factory.binnacle.Anthill.length - 1];
                                }
                            }
                        }
                    }
                },
                createFood: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 60,
                        y: 70,
                        width: 50,
                        height: 50,
                        text: '🍓',
                        font: '16px Mouse',
                        bg: this.buttonsStates.createFood === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.createFood === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => {
                                if (!this.buttonsStates.PLAY.createTrace && !this.buttonsStates.PLAY.loop) {
                                    this.abstractStates.creating = true;
                                    this.buttonsStates.createFood = 'click';
                                    this.app.game.level.Food({amount: 1});
                                    this.creation = this.app.factory.binnacle.Food[this.app.factory.binnacle.Food.length - 1];
                                }
                            },
                            mouseup: () => this.buttonsStates.createFood = 'normal'
                        }
                    }
                },
                createTrace: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 120,
                        y: 70,
                        width: 50,
                        height: 50,
                        text: 'Trace',
                        font: '16px Mouse',
                        bg: this.buttonsStates.createFood === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.createFood === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => this.buttonsStates.createTrace = this.buttonsStates.createTrace === 'normal' ? 'click' : 'normal',
                        }
                    }
                },
                width: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 35,
                        y: 150,
                        width: 200,
                        height: 20,
                        text: `< Width: ${this.app.game?.level?.size?.width} >`,
                        font: '10px Mouse',
                        bg: this.buttonsStates.width === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.width === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => console.log('width'),
                            mouseup: () => this.buttonsStates.height = 'normal'
                        }
                    }
                },
                height: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 35,
                        y: 180,
                        width: 200,
                        height: 20,
                        text: `< Height: ${this.app.game?.level?.size?.height} >`,
                        font: '10px Mouse',
                        bg: this.buttonsStates.height === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.height === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => console.log('height'),
                            mouseup: () => this.buttonsStates.height = 'normal'
                        }
                    }
                },
                minTrace: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 35,
                        y: 210,
                        width: 200,
                        height: 20,
                        text: `< minTrace: ${this.app.factory.binnacle.Traces &&
                        this.app.factory.binnacle.Traces[0] &&
                        this.app.factory.binnacle.Traces[0]?.props?.min || 'N/A'} >`,
                        font: '10px Mouse',
                        bg: isAnthillIn ?
                            (this.buttonsStates.minTrace === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.minTrace === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            COLORS.BLACK[5],
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => console.log('minTrace'),
                            mouseup: () => this.buttonsStates.minTrace = 'normal'
                        }
                    }
                },
                maxTrace: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 35,
                        y: 240,
                        width: 200,
                        height: 20,
                        text: `< maxTrace: ${this.app.factory.binnacle.Traces &&
                        this.app.factory.binnacle.Traces[0] &&
                        this.app.factory.binnacle.Traces[0]?.props?.max || 'N/A'} >`,
                        font: '10px Mouse',
                        bg: isAnthillIn ?
                            (this.buttonsStates.maxTrace === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.maxTrace === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            COLORS.BLACK[5],
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            click: () => console.log('maxTrace'),
                            mouseup: () => this.buttonsStates.maxTrace = 'normal'
                        }
                    }
                },
                loopSize: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 35,
                        y: 270,
                        width: 200,
                        height: 20,
                        text: `< loopSize: ${this.app.game?.flags?.antLooper} >`,
                        font: '10px Mouse',
                        bg: isAnthillIn ?
                            (this.buttonsStates.loopSize === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.loopSize === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            COLORS.BLACK[5],
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => this.buttonsStates.loopSize = 'click',
                            mouseup: () => this.buttonsStates.loopSize = 'normal'
                        }
                    }
                },
                createLoop: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 35,
                        y: 300,
                        width: 200,
                        height: 20,
                        text: 'Create Loop',
                        font: '10px Mouse',
                        bg: isAnthillIn ?
                            (this.buttonsStates.createLoop === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.createLoop === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            COLORS.BLACK[5],
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => {
                                if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                        this.buttonsStates.createLoop = this.buttonsStates.createLoop === 'click' ? 'normal' : 'click';
                                }
                            }
                        }
                    }
                },
                saveNetworks: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 35,
                        y: 330,
                        width: 30,
                        height: 20,
                        text: '💾',
                        font: "10px Mouse",
                        bg: this.app.factory.binnacle?.Ant?.length > 0 ?
                            (this.buttonsStates.saveNetworks === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.saveNetworks === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            COLORS.BLACK[5],
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => {
                                if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                    this.buttonsStates.saveNetworks = 'click';
                                    Parser.save(this.app.factory.binnacle.Ant);
                                }
                            },
                            mouseup: () => this.buttonsStates.saveNetworks = 'normal'
                        }
                    }
                },
                loadFromNetworks: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 75,
                        y: 330,
                        width: 30,
                        height: 20,
                        text: '📁',
                        font: "10px Mouse",
                        bg: this.app.factory.binnacle?.Ant?.length > 0 ?
                            (this.buttonsStates.loadFromNetworks === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.loadFromNetworks === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            COLORS.BLACK[5],
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            callbacks: {
                                click: () => {
                                    if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                        this.buttonsStates.loading = this.buttonsStates.loading === 'normal' ? 'click' : 'normal';
                                        if(this.buttonsStates.play.loading === 'click') {
                                            this.app.game.LOADED_BRAINS = Parser.load();
                                            window.a = this.app.game.LOADED_BRAINS;
                                            window.b = this.app.player.ant;
                                        } else {
                                            this.app.game.LOADED_BRAINS = false;
                                        }
                                    }
                                },
                            }
                        }
                    }
                },
                clearNetworks: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: 115,
                        y: 330,
                        width: 30,
                        height: 20,
                        text: '🗑',
                        font: "10px Mouse",
                        bg: this.buttonsStates.clearNetworks === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                            : this.buttonsStates.clearNetworks === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                : this.colors.MAIN_MENU.buttons.variation1.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousedown: () => {
                                this.buttonsStates.clearNetworks = 'click';
                                localStorage.removeItem('_best');
                            },
                            mouseup: () => this.buttonsStates.clearNetworks = 'normal'
                        }
                    }
                }
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
                        font: '70px Mouse',
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
                        width,
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
                        text: antSelected,
                        antSelected,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 30,
                    }
                },
                food_bar: {
                    type: 'bar',
                    props: {
                        ctx,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 65,
                        text: pickedBarText,
                        cap: 220,
                        fill: (entity?.pickedFood ?? 0) / 220,
                        fillColor: 'green-red',
                        barColor: 'rgba(0,0,0,0.5)',
                        stroke: '#000'
                    }
                },
                energy_bar: {
                    type: 'bar',
                    props: {
                        ctx,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 65 + 40,
                        text: energyText,
                        cap: 220,
                        fill: (entity?.energy ?? 0) / 220,
                        fillColor: 'red-green',
                        barColor: 'rgba(0,0,0,0.5)',
                        stroke: '#000'
                    }
                },
                size_selectors: {
                    type: 'square',
                    props: {
                        ctx,
                        x: cardPosition.x + 15,
                        y: cardPosition.y + 130,
                        width: 220,
                        height: 220,
                        color: 'rgba(80,62,50,0.75)',
                        stroke: 'rgb(0,0,0)'
                    }
                },
                ant_counter: {
                    type: 'text',
                    props: {
                        ctx,
                        font,
                        text: `${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`,
                        x: window.innerWidth - (this.app.gui.ctx.measureText(`${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`).width * 2.2) - 10,
                        y: window.innerHeight - 10,
                    }
                },
            }
        };

        this.app.log.printLog(ctx, font);

        // UPDATE CONTROLS
        if (this.app.game.state.state === PLAY && this.app.game.level) {
            // UPDATE CAMERA
            if (!this.app.player?.ant?.speed) return;
            this.app.player.followCamera &&
            this.app.player.ant.speed !== 0 &&
            this.app.camera.follow(this.app.player?.ant);
        }
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
            if (!key[0] || !key[1]) return;
            this.hoverCollection[key[0]] = key[1].props;
        });
        // CANVAS BACKGROUND
        this.app.gui.ctx.canvas.style.backgroundColor = this.colors[this.app.game.state.state].background;
    }
}