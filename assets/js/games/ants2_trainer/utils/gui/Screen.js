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
        this.abstractStates = {};
        this.updateExtend = () => {
            if (this.app.game.state.state === PLAY && this.app.game.level) {
                if (!this.app.player?.ant?.speed) return;
                this.app.player.followCamera &&
                this.app.player.ant.speed !== 0 &&
                this.app.camera.follow(this.app.player?.ant);
            }
        };
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
            },
            mouseup: (e) => {
                // CLEAR STATES
                this.buttonsStates.createAnt = 'normal';
                this.buttonsStates.width = 'normal';
                this.buttonsStates.height = 'normal';
                this.buttonsStates.minTrace = 'normal';
                this.buttonsStates.maxTrace = 'normal';
                this.buttonsStates.loopSize = 'normal';
                this.buttonsStates.saveNetworks = 'normal';
                this.abstractStates.tracing = false;

                if (this.abstractStates.creating) {
                    const objX = (this.creation?.size?.width ?? this.creation.width);
                    const objY = (this.creation?.size?.height ?? this.creation.height);
                    const map = {
                        x: (-this.app.game.level.size.width + objX) / 2,
                        y: (-this.app.game.level.size.height + objY) / 2,
                        width: this.app.game.level.size.width - objX,
                        height: this.app.game.level.size.height - objY
                    }
                    const click = this.app.gui.get.viewportCoords(
                        {x: e.offsetX, y: e.offsetY},
                        this.app.camera.viewport
                    );
                    if (this.app.gui.get.isHover(map, click)) {
                        this.creation = null;
                        this.abstractStates.creating = false;
                        this.buttonsStates.createAnthill = 'normal';
                        this.buttonsStates.createFood = 'normal';
                    }
                }
            },
            mousedown: (e) => {
                if (this.buttonsStates.createTrace) this.abstractStates.tracing = true;
            },
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

    #getButtons() {
        const output = {};
        Object.entries(this.buttonsCollection).forEach(key =>
            Object.entries(key[1]).forEach(button => {
                if (typeof button[1] === 'object') output[button[0]] = button[1];
            }));
        return output;
    }

    update() {
        const isAnthillIn = this.updateExtend();

        const {
            color,
            font,
            antSelected,
            pickedBarText,
            energyText,
            entity
        } = this.#getPlayDataStrings();

        this.colors = {
            MAIN_MENU: {
                background: COLORS.WHITE[0],
                buttons: {
                    variation1: {
                        hover: COLORS.YELLOW[2],
                        click: COLORS.YELLOW[0],
                        normal: COLORS.YELLOW[1],
                        stroke: COLORS.BLACK[0]
                    },
                    disabled: {
                        hover: COLORS.BLACK[8],
                        click: COLORS.BLACK[8],
                        normal: COLORS.BLACK[8],
                        stroke: COLORS.BLACK[0]
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
                        bg: this.app.factory.binnacle['Traces'] ?
                            (this.buttonsStates.createAnt === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.createAnt === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal)
                            : this.colors.MAIN_MENU.buttons.disabled.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mouseup: () => this.app.player.anthill.addAnt()
                        }
                    }
                },
                createAnthill: {
                    type: 'button',
                    props: {
                        position: 'controls',
                        ctx: this.app.game.gui.controlsCtx,
                        x: this.gui.controlsCtx.canvas.width - 220,
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
                            mouseup: () => {
                                if (this.buttonsStates.createAnthill !== 'click' && !this.buttonsStates.loop) {
                                    this.abstractStates.creating = true;
                                    this.buttonsStates.createAnthill = 'click';
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
                            mouseup: () => {
                                if (this.buttonsStates.createFood !== 'click' && !this.abstractStates.looping) {
                                    this.abstractStates.creating = true;
                                    this.buttonsStates.createFood = 'click';
                                    this.app.game.level.Food({amount: 1});
                                    this.creation = this.app.factory.binnacle.Food[this.app.factory.binnacle.Food.length - 1];
                                }
                            }
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
                        bg: this.app.factory.binnacle['Traces'] ?
                            (this.buttonsStates.createTrace === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.createTrace === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal)
                            : this.colors.MAIN_MENU.buttons.disabled.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousemove: (event, hoverTranslatedCoords) => {
                                // CREATING TRACE PROCESS
                                if (this.buttonsStates.createTrace === 'click' && this.app.factory.binnacle['Anthill']) {
                                    const entity = {
                                        x: (-this.app.game.level.size.width) / 2,
                                        y: (-this.app.game.level.size.height) / 2,
                                        width: this.app.game.level.size.width,
                                        height: this.app.game.level.size.height
                                    }
                                    if (this.app.gui.get.isHover(entity, hoverTranslatedCoords) &&
                                        this.abstractStates.tracing) {
                                        this.app.factory.binnacle['Traces'][0].markTrace(hoverTranslatedCoords);
                                    }
                                }
                            },
                            mouseup: (e) => {
                                this.buttonsStates.createTrace = this.buttonsStates.createTrace === 'click' ? 'normal' : 'click';
                            }
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
                            mousemove: (event) => {
                                // DRAG RESIZE WIDTH
                                if (this.buttonsStates.width === 'click') {
                                    this.app.game.level.size.width += event.movementX;
                                    this.app.game.level.coords.x = -this.app.game.level.size.width / 2 ?? 100;
                                }
                            },
                            mousedown: () => this.buttonsStates.width = 'click'
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
                            mousemove: (event) => {
                                // DRAG RESIZE HEIGHT
                                if (this.buttonsStates.height === 'click') {
                                    const increment = event.movementX;
                                    this.app.game.level.size.height += increment;
                                    this.app.game.level.coords.y = -this.app.game.level.size.height / 2 ?? 100;
                                }
                            },
                            mousedown: () => this.buttonsStates.height = 'click'
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
                        bg: this.app.factory.binnacle['Traces'] ?
                            (this.buttonsStates.minTrace === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.minTrace === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            this.colors.MAIN_MENU.buttons.disabled.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousemove: (event) => {
                                // DRAG MIN TRACE - (click, drag and drop)
                                if (this.buttonsStates.minTrace === 'click') {
                                    if (this.app.factory.binnacle['Traces'] && this.app.factory.binnacle['Traces'][0]) {
                                        const ref = this.app.factory.binnacle['Traces'][0].props.min;
                                        const refMax = this.app.factory.binnacle['Traces'][0].props.max;
                                        if (ref >= 1 && ref <= refMax) {
                                            this.app.factory.binnacle['Traces'][0].props.min += event.movementX;
                                        }
                                        if (ref > refMax) {
                                            this.app.factory.binnacle['Traces'][0].props.min = refMax;
                                        }
                                        if (ref < 1) {
                                            this.app.factory.binnacle['Traces'][0].props.min = 1;
                                        }
                                    }
                                }
                            },
                            mousedown: () => this.buttonsStates.minTrace = 'click',
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
                        bg: this.app.factory.binnacle['Traces'] ?
                            (this.buttonsStates.maxTrace === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.maxTrace === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            this.colors.MAIN_MENU.buttons.disabled.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousemove: (event) => {
                                // DRAG UPDATE MAX TRACE - (click, drag and drop)
                                if (this.buttonsStates.maxTrace === 'click') {
                                    if (this.app.factory.binnacle['Traces'] && this.app.factory.binnacle['Traces'][0]) {
                                        const ref = this.app.factory.binnacle['Traces'][0].props.max;
                                        const refMin = this.app.factory.binnacle['Traces'][0].props.min;
                                        if (ref >= refMin && ref <= 30) {
                                            this.app.factory.binnacle['Traces'][0].props.max += event.movementX;
                                        }
                                        if (ref > 30) {
                                            this.app.factory.binnacle['Traces'][0].props.max = 30;
                                        }
                                        if (ref < refMin) {
                                            this.app.factory.binnacle['Traces'][0].props.max = refMin;
                                        }
                                    }
                                }
                            },
                            mousedown: () => this.buttonsStates.maxTrace = 'click'
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
                        bg: this.app.factory.binnacle['Traces'] ?
                            (this.buttonsStates.loopSize === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.loopSize === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal) :
                            this.colors.MAIN_MENU.buttons.disabled.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mousemove: (event) => {
                                // DRAG UPDATE LOOP SIZE - (click, drag and drop)
                                if (this.buttonsStates.loopSize === 'click') {
                                    const ref = this.app.game.flags.antLooper;
                                    const refMax = 3000
                                    const refMin = 20;
                                    if (ref >= refMin && ref <= refMax) {
                                        this.app.game.flags.antLooper += event.movementX;
                                    }
                                    if (ref > refMax) {
                                        this.app.game.flags.antLooper = refMax;
                                    }
                                    if (ref < refMin) {
                                        this.app.game.flags.antLooper = refMin;
                                    }
                                }
                            },
                            mousedown: () => this.buttonsStates.loopSize = 'click'
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
                        bg: this.app.factory.binnacle['Anthill'] ?
                            (this.buttonsStates.createLoop === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
                                : this.buttonsStates.createLoop === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
                                    : this.colors.MAIN_MENU.buttons.variation1.normal)
                            : this.colors.MAIN_MENU.buttons.disabled.normal,
                        stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
                        widthStroke: 2,
                        callbacks: {
                            mouseup: (event) => {
                                this.buttonsStates.createLoop = this.buttonsStates.createLoop === 'click' ? 'normal' : 'click';
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
                            click: () => {
                                if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                    this.buttonsStates.saveNetworks = 'click';
                                    Parser.save(this.app.factory.binnacle.Ant);
                                }
                            }
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
                                        if (this.buttonsStates.play.loading === 'click') {
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
                            click: () => this.buttonsStates.clearNetworks = 'click'
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
                        x: 10,
                        y: 10,
                        width: 250,
                        height: 360,
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
                        x: 10 + 15,
                        y: 10 + 30,
                    }
                },
                food_bar: {
                    type: 'bar',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        x: 10 + 15,
                        y: 10 + 65,
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
                        ctx: this.app.game.gui.controlsCtx,
                        x: 10 + 15,
                        y: 10 + 65 + 40,
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
                        ctx: this.app.game.gui.controlsCtx,
                        x: 10 + 15,
                        y: 10 + 130,
                        width: 220,
                        height: 220,
                        color: 'rgba(80,62,50,0.75)',
                        stroke: 'rgb(0,0,0)'
                    }
                },
                ant_counter: {
                    type: 'text',
                    props: {
                        ctx: this.app.game.gui.controlsCtx,
                        font,
                        text: `${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`,
                        x: window.innerWidth - (this.app.gui.ctx.measureText(`${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`).width * 2.2) - 10,
                        y: window.innerHeight - 10,
                    }
                },
            }
        };

        this.app.log.printLog(this.app.game.gui.controlsCtx, font);
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
        if (!this.colors[this.app.game.state.state].background) return;
        this.app.gui.ctx.canvas.style.backgroundColor = this.colors[this.app.game.state.state].background
    }
}