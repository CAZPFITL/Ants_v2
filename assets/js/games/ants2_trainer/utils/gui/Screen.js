import Traces from "./../../../ants2/utils/entities/Traces.js";
import Parser from "../../../ants2/utils/components/Parser.js";
import {
    PLAY,
    MAIN_MENU,
    GAME_OVER,
    NETWORK
} from "../../../ants2/env.js";

export default class Screen {
    /**
     * @param app {object}
     * @param gui {object}
     */
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
        this.hoverCollection = {};
        this.buttons = {
            play: {
                creatingAnt: false,
                creatingAnthill: false,
                creatingFood: false,
                creating: false,
                resizingW: false,
                resizingH: false,
                minTracing: false,
                maxTracing: false,
                radiusTracing: false,
                looping: false,
                loopSizing: false,
                networking: false,
                saving: false,
                loading: false,
                oscillating: false,
            },
            main_menu: {
                start: false
            },
            networks: {
                positioning: false,
                player: false,
            },
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
                    'createAnthill': {},
                    'createFood': {},
                    'creatingTrace': {},
                    'drawingTrace': {},
                    'saveNetworks': {},
                    'loadFromNetworks': {},
                    'oscillateMap': {}
                },
                boardControls: {
                    'width': {},
                    'height': {},
                    'minTrace': {},
                    'maxTrace': {},
                    'traceRadius': {},
                    'loopSize': {},
                    'createLoop': {}
                }
            },
            networks: {
                'player': {}
            }
        }
        this.#addListeners();
    }

    /**
     * Add Event Listeners
     */
    #addListeners() {
        this.app.controls.pushListener(this, 'mousemove', (e) => {
            // TRANSLATE COORDS - general process
            const hoverTranslatedCoords = this.app.gui.get.viewportCoords({
                x: e.offsetX,
                y: e.offsetY
            }, this.app.camera.viewport);
            if (this.app.game.state.state === PLAY) {
                // CREATING ENTITY PROCESS
                if (this.buttons.play.creating) {
                    if (this.creation?.coords) {
                        (this.creation.coords = hoverTranslatedCoords);
                    } else {
                        this.creation.x = hoverTranslatedCoords?.x;
                        this.creation.y = hoverTranslatedCoords?.y;
                    }
                }
                //CREATING TRACE PROCESS (ONLY INSIDE THE MAP)
                if (this.buttons.play.drawingTrace) {
                    const entity = {
                        x: (-this.app.game.level.size.width) / 2,
                        y: (-this.app.game.level.size.height) / 2,
                        width: this.app.game.level.size.width,
                        height: this.app.game.level.size.height
                    }
                    if (this.app.gui.get.isHover(entity, hoverTranslatedCoords)) {
                        this.app.factory.binnacle['Traces'][0].markTrace(hoverTranslatedCoords);
                    }
                }
                // DRAG RESIZE WIDTH - (click, drag and drop)
                if (this.buttons.play.resizingW) {
                    this.app.game.level.size.width += e.movementX;
                    this.app.game.level.coords.x = -this.app.game.level.size.width / 2 ?? 100;
                }
                // DRAG RESIZE HEIGHT - (click, drag and drop)
                if (this.buttons.play.resizingH) {
                    const increment = e.movementX;
                    this.app.game.level.size.height += increment;
                    this.app.game.level.coords.y = -this.app.game.level.size.height / 2 ?? 100;
                }
                // DRAG TRACE RADIUS - (click, drag and drop)
                if (this.buttons.play.radiusTracing) {
                    if (this.app.factory.binnacle['Traces'] && this.app.factory.binnacle['Traces'][0]) {
                        const ref = this.app.factory.binnacle['Traces'][0].props.spreadMark;
                        if (ref >= 2 && ref <= 15) {
                            this.app.factory.binnacle['Traces'][0].props.spreadMark += e.movementX;
                        }
                        if (ref > 15) {
                            this.app.factory.binnacle['Traces'][0].props.spreadMark = 15;
                        }
                        if (ref < 2) {
                            this.app.factory.binnacle['Traces'][0].props.spreadMark = 2;
                        }
                    }
                }
                // DRAG MIN TRACE - (click, drag and drop)
                if (this.buttons.play.minTracing) {
                    if (this.app.factory.binnacle['Traces'] && this.app.factory.binnacle['Traces'][0]) {
                        const ref = this.app.factory.binnacle['Traces'][0].props.min;
                        const refMax = this.app.factory.binnacle['Traces'][0].props.max;
                        if (ref >= 1 && ref <= refMax) {
                            this.app.factory.binnacle['Traces'][0].props.min += e.movementX;
                        }
                        if (ref > refMax) {
                            this.app.factory.binnacle['Traces'][0].props.min = refMax;
                        }
                        if (ref < 1) {
                            this.app.factory.binnacle['Traces'][0].props.min = 1;
                        }
                    }
                }
                // DRAG UPDATE MAX TRACE - (click, drag and drop)
                if (this.buttons.play.maxTracing) {
                    if (this.app.factory.binnacle['Traces'] && this.app.factory.binnacle['Traces'][0]) {
                        const ref = this.app.factory.binnacle['Traces'][0].props.max;
                        const refMin = this.app.factory.binnacle['Traces'][0].props.min;
                        if (ref >= refMin && ref <= 30) {
                            this.app.factory.binnacle['Traces'][0].props.max += e.movementX;
                        }
                        if (ref > 30) {
                            this.app.factory.binnacle['Traces'][0].props.max = 30;
                        }
                        if (ref < refMin) {
                            this.app.factory.binnacle['Traces'][0].props.max = refMin;
                        }
                    }
                }
                // DRAG UPDATE LOOP SIZE - (click, drag and drop)
                if (this.buttons.play.loopSizing) {
                    const ref = this.app.game.flags.antLooper;
                    const refMax = 3000
                    const refMin = 20;
                    if (ref >= refMin && ref <= refMax) {
                        this.app.game.flags.antLooper += e.movementX;
                    }
                    if (ref > refMax) {
                        this.app.game.flags.antLooper = refMax;
                    }
                    if (ref < refMin) {
                        this.app.game.flags.antLooper = refMin;
                    }
                }
            }
            // HOVER COLLECTION - (hover)
            for (const key in this.hoverCollection) {
                if (
                    this.app.gui.get.isHover(
                        this.hoverCollection[key],
                        {x: e.clientX, y: e.clientY}
                    ) ||
                    this.app.gui.get.isHover(
                        this.hoverCollection[key],
                        hoverTranslatedCoords
                    )
                ) {
                    this.hoverCaller = key;
                    this.gui.hoverStateIn();
                } else {
                    if (this.hoverCaller === key) {
                        this.hoverCaller = null;
                        this.gui.hoverStateOut();
                    }
                }
            }
        });
        this.app.controls.pushListener(this, 'mouseup', (e) => {
            if (this.app.game.state.state === MAIN_MENU) {
                // START TRAINING
                this.app.gui.get.isClicked(
                    this.buttonsCollection.main_menu.mainMenuControls.start,
                    this.app.gui.get.clickCoords(e, this.app.camera.viewport),
                    () => {
                        this.gui.hoverStateOut();
                        this.app.game.state.setState(PLAY);
                    }
                );
                this.buttons.main_menu.start = false;
            }
            if (this.app.game.state.state === PLAY) {
                // CLEAR PLAY BUTTONS RELEASE - (mouseup)
                this.buttons.play.loopSizing = false;
                this.buttons.play.minTracing = false;
                this.buttons.play.maxTracing = false;
                this.buttons.play.radiusTracing = false;
                this.buttons.play.resizingW = false;
                this.buttons.play.resizingH = false;
                this.buttons.play.creatingAnt = false;
                this.buttons.play.drawingTrace = false;
                this.buttons.play.networking = false;

                if (!this.buttons.play.creating) {
                    // CREATE TRACE
                    this.app.gui.get.isClicked(
                        this.buttonsCollection.play.anthillControls.createTrace,
                        {x: e.offsetX, y: e.offsetY},
                        () => {
                            this.buttons.play.creatingTrace = !this.buttons.play.creatingTrace
                        }
                    )
                    // SAVE NETWORKS
                    this.app.gui.get.isClicked(
                        this.buttonsCollection.play.boardControls.saveNetworks,
                        {x: e.offsetX, y: e.offsetY},
                        () => {
                            if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                this.buttons.play.saving = 0;
                                Parser.save(this.app.factory.binnacle.Ant);
                            }
                        }
                    )
                    // LOAD FROM NETWORKS
                    this.app.gui.get.isClicked(
                        this.buttonsCollection.play.boardControls.loadFromNetworks,
                        {x: e.offsetX, y: e.offsetY},
                        () => {
                            if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                this.buttons.play.loading = !this.buttons.play.loading;
                                if(this.buttons.play.loading) {
                                    this.app.game.LOADED_BRAINS = Parser.load();
                                } else {
                                    this.app.game.LOADED_BRAINS = false;
                                }
                            }
                        }
                    )
                    // OSCILLATE MAP
                    this.app.gui.get.isClicked(
                        this.buttonsCollection.play.boardControls.oscillateMap,
                        {x: e.offsetX, y: e.offsetY},
                        () => {
                            this.buttons.play.oscillating = !this.buttons.play.oscillating;
                        }
                    )
                    if (!this.buttons.play.creatingTrace && !this.buttons.play.looping) {
                        // CREATE ANTHILL - (mouseup)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.anthillControls.createAnthill,
                            {x: e.offsetX, y: e.offsetY},
                            () => {
                                this.buttons.play.creating = true;
                                this.buttons.play.creatingAnthill = true;
                                this.app.game.level.Anthill({ants: 0, free: true});
                                this.creation = this.app.factory.binnacle.Anthill[this.app.factory.binnacle.Anthill.length - 1];
                            }
                        )
                        // CREATE FOOD - (mouseup)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.anthillControls.createFood,
                            {x: e.offsetX, y: e.offsetY},
                            () => {
                                this.buttons.play.creating = true;
                                this.buttons.play.creatingFood = true
                                this.app.game.level.Food({amount: 1});
                                this.creation = this.app.factory.binnacle.Food[this.app.factory.binnacle.Food.length - 1];
                            }
                        )
                        // CREATE ANT - (mouseup)
                        if (this.app.player.anthill) {
                            this.app.gui.get.isClicked(
                                this.buttonsCollection.play.anthillControls.createAnt,
                                {x: e.offsetX, y: e.offsetY},
                                () => {
                                    this.app.player.anthill.addAnt();
                                }
                            )
                        }
                    }
                    // // NETWORK - (mouseup)
                    // if (this.app.player.anthill) {
                    //     this.app.gui.get.isClicked(
                    //         this.buttonsCollection.play.anthillControls.networks,
                    //         {x: e.offsetX, y: e.offsetY},
                    //         () => {
                    //             this.gui.hoverStateOut();
                    //             this.app.game.state.setState(NETWORK);
                    //             this.gui.hoverStateOut();
                    //         }
                    //     )
                    // }
                } else {
                    const objX = (this.creation?.size?.width ?? this.creation.width);
                    const objY = (this.creation?.size?.height ?? this.creation.height);
                    const entity = {
                        x: (-this.app.game.level.size.width + objX) / 2,
                        y: (-this.app.game.level.size.height + objY) / 2,
                        width: this.app.game.level.size.width - objX,
                        height: this.app.game.level.size.height - objY
                    }
                    const click = this.app.gui.get.viewportCoords(
                        {x: e.offsetX, y: e.offsetY},
                        this.app.camera.viewport
                    );
                    if (this.app.gui.get.isHover(entity, click)) {
                        this.creation = null;
                        this.buttons.play.creating = false;
                        this.buttons.play.creatingAnthill = false;
                        this.buttons.play.creatingFood = false;
                    }
                }
            }
            // if (this.app.game.state.state === NETWORK) {
            //     // USE PLAYERS ANT
            //     this.app.gui.get.isClicked(
            //         this.buttonsCollection.networks.player,
            //         {x: e.offsetX, y: e.offsetY},
            //         () => {
            //             if (this.app.factory.binnacle.FamilyTree[0].memberSelected) {
            //                 this.app.factory.binnacle.FamilyTree[0].applyBrain(this.app.player.ant);
            //             }
            //         }
            //     );
            //     // BACK
            //     this.app.gui.get.isClicked(
            //         this.buttonsCollection.networks.back,
            //         {x: e.offsetX, y: e.offsetY},
            //         () => {
            //             this.app.game.state.setState(PLAY);
            //         }
            //     );
            //     // SAVE
            //     this.app.gui.get.isClicked(
            //         this.buttonsCollection.networks.save,
            //         {x: e.offsetX, y: e.offsetY},
            //         () => {
            //             console.log('save');
            //             this.app.factory.binnacle.FamilyTree[0].save();
            //         }
            //     );
            //     // LOAD
            //     this.app.gui.get.isClicked(
            //         this.buttonsCollection.networks.load,
            //         {x: e.offsetX, y: e.offsetY},
            //         () => {
            //             console.log('load');
            //             this.app.factory.binnacle.FamilyTree[0].load();
            //         }
            //     );
            //
            //     // MEMBERS CLICK
            //     this.app.factory.binnacle.Member.forEach(key => {
            //         this.app.gui.get.isClicked(
            //             key,
            //             this.app.gui.get.clickCoords(e, this.app.camera.viewport),
            //             () => {
            //                 this.app.factory.binnacle.FamilyTree[0].selectMember(key)
            //                 if (
            //                     key.group.father.brain &&
            //                     key.group.mother.brain &&
            //                     !key.brain &&
            //                     key.role === 'child'
            //                 ) {
            //                     key.group.procreate();
            //                 }
            //             }
            //         )
            //     });
            //     this.buttons.networks.player = false;
            // }
        });
        this.app.controls.pushListener(this, 'mousedown', (e) => {
            if (this.app.game.state.state === MAIN_MENU) {
                // START TRAINING
                this.app.gui.get.isClicked(
                    this.buttonsCollection.main_menu.mainMenuControls.start,
                    this.app.gui.get.clickCoords(e, this.app.camera.viewport),
                    () => {
                        this.buttons.main_menu.start = true;
                    }
                );
            }
            if (this.app.game.state.state === PLAY) {
                // CREATING MODE BLOCKS EVERYTHING
                if (!this.buttons.play.creating) {
                    // SAVE NETWORKS
                    this.app.gui.get.isClicked(
                        this.buttonsCollection.play.boardControls.saveNetworks,
                        {x: e.offsetX, y: e.offsetY},
                        () => {
                            if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                this.buttons.play.saving = 1
                            }
                        }
                    );
                    // LOOP ON/OFF
                    this.app.gui.get.isClicked(
                        this.buttonsCollection.play.boardControls.createLoop,
                        {x: e.offsetX, y: e.offsetY},
                        () => {
                            if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                this.buttons.play.looping = !this.buttons.play.looping
                            }
                        }
                    )
                    if (!this.buttons.play.creatingTrace) {
                        // RESIZING WIDTH - (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.boardControls.width,
                            {x: e.offsetX, y: e.offsetY},
                            () => this.buttons.play.resizingW = true
                        )
                        // RESIZING HEIGHT - (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.boardControls.height,
                            {x: e.offsetX, y: e.offsetY},
                            () => this.buttons.play.resizingH = true
                        )
                        // MIN TRACING - (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.boardControls.minTrace,
                            {x: e.offsetX, y: e.offsetY},
                            () => {
                                if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                    this.buttons.play.minTracing = true
                                }
                            }
                        )
                        // MAX TRACING - (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.boardControls.maxTrace,
                            {x: e.offsetX, y: e.offsetY},
                            () => {
                                if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                    this.buttons.play.maxTracing = true
                                }
                            }
                        )
                        // RADIUS TRACING - (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.boardControls.traceRadius,
                            {x: e.offsetX, y: e.offsetY},
                            () => {
                                if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                    this.buttons.play.radiusTracing = true
                                }
                            }
                        )
                        // LOOP SIZING - (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.boardControls.loopSize,
                            {x: e.offsetX, y: e.offsetY},
                            () => {
                                if ((this.app.factory.binnacle?.Anthill?.length ?? 0) > 0) {
                                    this.buttons.play.loopSizing = true
                                }
                            }
                        )
                        // NETWORK MENU (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.anthillControls.networks,
                            {x: e.offsetX, y: e.offsetY},
                            () => this.buttons.play.networking = true
                        )
                        // CREATE ANT - (mousedown)
                        this.app.gui.get.isClicked(
                            this.buttonsCollection.play.anthillControls.createAnt,
                            {x: e.offsetX, y: e.offsetY},
                            () => (this.app.player.anthill && !this.buttons.play.looping) && (this.buttons.play.creatingAnt = true)
                        )
                    } else {
                        this.buttons.play.drawingTrace = true;
                    }
                }
            }
        });
        this.app.controls.pushListener(this, 'keyup', (event) => {
            if (this.app.game.state.state === PLAY) {
                // RESTART CREATING MODE
                const restartCreating = () => {
                    this.buttons.play.creating = false;
                    this.buttons.play.creatingAnthill = false;
                    this.buttons.play.creatingFood = false;
                    this.buttons.play.looping = false;
                }
                const fallbackAnthill = () => {
                    // FALLBACK ANTHILL
                    if (this.app.factory.binnacle?.Anthill instanceof Array) {
                        if (this.app.factory.binnacle.Anthill.length === 0) {
                            this.app.player.anthill = null;
                            this.app.game.restart();
                        } else {
                            this.app.player.anthill = this.app.factory.binnacle.Anthill[this.app.factory.binnacle.Anthill.length - 1];
                        }
                    }
                }
                const clearCreationEntity = () => {
                    this.app.factory.remove(this.creation);
                    this.creation = null;
                }
                switch (true) {
                    case event.key === 'Delete':
                        // RESET EVERYTHING
                        restartCreating();
                        fallbackAnthill();
                        this.app.game.restart();
                        break;
                    case event.key === 'Escape':
                        this.app.player.ant = {};
                        // CLEAR CREATING MODE
                        if (this.buttons.play.creating) {
                            clearCreationEntity();
                            restartCreating();
                            fallbackAnthill();
                            break;
                        }
                        // CLEAR TRACER MODE
                        if (this.buttons.play.creatingTrace) {
                            this.buttons.play.creatingTrace = false;
                            this.buttons.play.drawingTrace = false;
                            fallbackAnthill();
                        }

                }
            }
        });
    }

    /**
     * Get Play Data Strings
     * @returns {{color: string, pickedBarText: string, energyText: string, antSelected: string, entity: object, font: string}}
     */
    #getPlayDataStrings() {
        const ant = this.app.player.ant
        const anthill = this.app.player.anthill

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

    /**
     * Update method
     */
    update() {
        // UPDATE CONTROLS
        const font = "16px Mouse";
        if (this.app.game.state.state === MAIN_MENU) {
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
        if (this.app.game.state.state === PLAY && this.app.game.level) {
            // PLAY BUTTONS
            const isAnthillIn = Boolean(this.app.factory.binnacle?.Anthill?.length)
            this.buttonsCollection.play.anthillControls = {
                'createAnt': {
                    x: this.gui.controlsCtx.canvas.width - 120,
                    y: 10,
                    width: 50,
                    height: 50,
                    text: '🐜',
                    font,
                    bg: !this.buttons.play.creatingAnt ? '#b47607' : '#ffa600'
                },
                'createAnthill': {
                    x: this.gui.controlsCtx.canvas.width - 60,
                    y: 10,
                    width: 50,
                    height: 50,
                    text: '🏠',
                    font,
                    bg: !this.buttons.play.creatingAnthill ? '#b47607' : '#ffa600'
                },
                'createFood': {
                    x: this.gui.controlsCtx.canvas.width - 60,
                    y: 70,
                    width: 50,
                    height: 50,
                    text: '🍓',
                    font,
                    bg: !this.buttons.play.creatingFood ? '#b47607' : '#ffa600'
                },
                'createTrace': {
                    x: this.gui.controlsCtx.canvas.width - 120,
                    y: 70,
                    width: 50,
                    height: 50,
                    text: 'Trace',
                    font: "12px Mouse",
                    bg: !this.buttons.play.creatingTrace ? '#b47607' : '#ffa600'
                },
                // 'networks': {
                //     x: this.gui.controlsCtx.canvas.width - 90,
                //     y: 130,
                //     width: 80,
                //     height: 50,
                //     text: 'Networks',
                //     font,
                //     bg: !this.buttons.play.networking ? '#b47607' : '#ffa600'
                // }
            }
            this.buttonsCollection.play.boardControls = {
                'width': {
                    x: 35,
                    y: 150,
                    width: 200,
                    height: 20,
                    text: `< Width: ${this.app.game?.level?.size?.width} >`,
                    font,
                    bg: this.buttons.play.resizingW ? '#ffa600' : '#b47607'
                },
                'height': {
                    x: 35,
                    y: 180,
                    width: 200,
                    height: 20,
                    text: `< Height: ${this.app.game?.level?.size?.height} >`,
                    font,
                    bg: this.buttons.play.resizingH ? '#ffa600' : '#b47607'
                },
                'minTrace': {
                    x: 35,
                    y: 210,
                    width: 200,
                    height: 20,
                    text: `< minTrace: ${this.app.factory.binnacle.Traces &&
                    this.app.factory.binnacle.Traces[0] &&
                    this.app.factory.binnacle.Traces[0]?.props?.min || 'N/A'} >`,
                    font,
                    bg: isAnthillIn ? (this.buttons.play.minTracing ? '#ffa600' : '#b47607') : '#7a7a79'
                },
                'maxTrace': {
                    x: 35,
                    y: 240,
                    width: 200,
                    height: 20,
                    text: `< maxTrace: ${this.app.factory.binnacle.Traces &&
                    this.app.factory.binnacle.Traces[0] &&
                    this.app.factory.binnacle.Traces[0]?.props?.max || 'N/A'} >`,
                    font,
                    bg: isAnthillIn ? (this.buttons.play.maxTracing ? '#ffa600' : '#b47607') : '#7a7a79'
                },
                // 'traceRadius': {
                //     x: 35,
                //     y: 270,
                //     width: 200,
                //     height: 20,
                //     text: `< traceRadius: ${this.app.factory.binnacle.Traces &&
                //     this.app.factory.binnacle.Traces[0] &&
                //     this.app.factory.binnacle.Traces[0]?.props?.spreadMark || 'N/A'} >`,
                //     font,
                //     bg: isAnthillIn ? (this.buttons.play.radiusTracing ? '#ffa600' : '#b47607') : '#7a7a79'
                // },
                'loopSize': {
                    x: 35,
                    y: 270,
                    width: 200,
                    height: 20,
                    text: `< loopSize: ${this.app.game?.flags?.antLooper} >`,
                    font,
                    bg: isAnthillIn ? (this.buttons.play.loopSizing ? '#ffa600' : '#b47607') : '#7a7a79'
                },
                'createLoop': {
                    x: 35,
                    y: 300,
                    width: 200,
                    height: 20,
                    text: 'Create Loop',
                    font,
                    bg: isAnthillIn ? (this.buttons.play.looping ? '#ffa600' : '#b47607') : '#7a7a79'
                },
                'saveNetworks': {
                    x: 35,
                    y: 330,
                    width: 30,
                    height: 20,
                    text: '💾',
                    font: "10px Mouse",
                    bg: this.app.factory.binnacle?.Ant?.length > 0 ? (this.buttons.play.saving ? '#ffa600' : '#b47607') : '#7a7a79'
                },
                'loadFromNetworks': {
                    x: 75,
                    y: 330,
                    width: 30,
                    height: 20,
                    text: '📁',
                    font: "10px Mouse",
                    bg: this.app.factory.binnacle?.Ant?.length > 0 ? (this.buttons.play.loading ? '#ffa600' : '#b47607') : '#7a7a79'
                },
                'oscillateMap': {
                    x: 115,
                    y: 330,
                    width: 30,
                    height: 20,
                    text: '⌘',
                    font: "10px Mouse",
                    bg: this.buttons.play.oscillating ? '#ffa600' : '#b47607'
                }
            }
            // UPDATE CAMERA
            if (!this.app.player?.ant?.speed) return;
            this.app.player.followCamera &&
            this.app.player.ant.speed !== 0 &&
            this.app.camera.follow(this.app.player?.ant);
        }
        // if (this.app.game.state.state === NETWORK) {
        //     this.buttonsCollection.networks = {
        //         'player': {
        //             x: 25,
        //             y: 50,
        //             width: 220,
        //             height: 25,
        //             text: `player's ant`,
        //             font,
        //             bg: !this.buttons.networks.player ? 'rgba(255,113,134,0.6)' : 'rgba(255,125,146,0.7)'
        //         },
        //         'back': {
        //             x: 10,
        //             y: this.gui.controlsCtx.canvas.height - 60,
        //             width: 80,
        //             height: 50,
        //             text: 'Back',
        //             font,
        //             bg: !this.buttons.networks.back ? 'rgba(255,113,134,0.6)' : 'rgba(255,125,146,0.7)'
        //         },
        //         'save': {
        //             x: this.gui.controlsCtx.canvas.width - 90,
        //             y: this.gui.controlsCtx.canvas.height - 60,
        //             width: 80,
        //             height: 50,
        //             text: 'Save',
        //             font,
        //             bg: !this.buttons.networks.save ? 'rgba(255,113,134,0.6)' : 'rgba(255,125,146,0.7)'
        //         },
        //         'load': {
        //             x: this.gui.controlsCtx.canvas.width - 180,
        //             y: this.gui.controlsCtx.canvas.height - 60,
        //             width: 80,
        //             height: 50,
        //             text: 'Load',
        //             font,
        //             bg: !this.buttons.networks.load ? 'rgba(255,113,134,0.6)' : 'rgba(255,125,146,0.7)'
        //         }
        //     }
        // }
    }

    /**
     * Draw Method
     */
    draw() {
        const useControlsCtx = this.app.game.state.state === PLAY
            || this.app.game.state.state === GAME_OVER
            || this.app.game.state.state === NETWORK
            && this.app.game.level;

        const ctx = (useControlsCtx) ? this.app.game.gui.controlsCtx : this.app.gui.ctx;

        // DRAW DECORATIONS
        if (this.app.game.state.state === MAIN_MENU) {
            this.app.gui.get.square({
                ctx,
                x: -300,
                y: -120,
                width: 600,
                height: 250,
                color: '#72604e',
                stroke: '#000000',
            });
            this.app.gui.get.text({
                ctx,
                font: "62px Mouse",
                text: 'Ants AI Trainer',
                x: 0,
                y: -35,
                color: '#ffffff',
                width: this.app.gui.ctx.measureText('Ants').width,
                height: 30,
                center: true
            });
            ctx.canvas.style.backgroundColor = 'rgb(130,169,30)';
        }
        if (this.app.game.state.state === PLAY) {
            const card = {
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

            // CALCULATE MAX CONTENT WIDTH FROM ALL ELEMENTS
            const height = 360;
            const width = this.app.tools.max([
                ctx.measureText(antSelected).width * 2,
                240
            ]) + 10;
            const sizes = {
                x: card.x + 15,
                y: card.y + 130,
                width: 220,
                height: 220,
            }
            // DATA BACKGROUND
            this.app.gui.get.square({
                ctx: this.app.game.gui.controlsCtx,
                x: card.x,
                y: card.y,
                width,
                height,
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
            this.app.gui.get.square({
                ctx,
                ...sizes,
                color: 'rgba(80,62,50,0.75)',
                stroke: 'rgb(0,0,0)'
            });
            // ANT COUNTER ON THE BOTTOM LEFT
            this.app.gui.get.text({
                ctx,
                font,
                text: `${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`,
                x: window.innerWidth - (this.app.gui.ctx.measureText(`${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`).width * 2.2) - 10,
                y: window.innerHeight - 10,
            });
            // PRINT LOG
            this.app.log.printLog(ctx, font);
        }
        if (this.app.game.state.state === NETWORK) {
            const ctx = this.app.game.gui.controlsCtx;
            const card = {
                x: 10,
                y: 10,
            }
            // CALCULATE MAX CONTENT WIDTH FROM ALL ELEMENTS
            const height = 360;
            const width = this.app.tools.max([
                ctx.measureText(this.app.player.ant).width * 2,
                240
            ]) + 10;
            const sizes = {
                x: card.x + 15,
                y: card.y + 130,
                width: 220,
                height: 220,
            }
            // DATA BACKGROUND
            this.app.gui.get.square({
                ctx,
                x: card.x,
                y: card.y,
                width,
                height,
                color: 'rgba(148,255,0,0.32)',
                stroke: '#000'
            });
            // TITLE
            this.app.gui.get.text({
                ctx,
                font: "20px Mouse",
                color: '#000000',
                text: 'Brains Available',
                x: card.x + 15,
                y: card.y + 30,
            });
            // SEPARATOR
            this.app.gui.get.line({
                ctx,
                x1: card.x + 15,
                y1: card.y + 40,
                x2: card.x + 15 + 220,
                y2: card.y + 40,
                width: 220,
                height: 1,
                color: '#000'
            })
            this.app.gui.ctx.canvas.style.backgroundColor = 'rgb(178,82,231)';
        }

        // DRAW CONTROLS
        const play = this.app.game.state.state === PLAY || this.app.game.state.state === GAME_OVER && this.app.game.level;
        const menu = this.app.game.state.state === MAIN_MENU;
        const network = this.app.game.state.state === NETWORK;

        const looper = (play) ? {
            createAnt: this.app.player.anthill ? {ctx, ...this.buttonsCollection.play.anthillControls.createAnt} : {},
            createAnthill: {ctx, ...this.buttonsCollection.play.anthillControls.createAnthill},
            createFood: this.app.player.anthill ? {ctx, ...this.buttonsCollection.play.anthillControls.createFood} : {},
            createTrace: this.app.player.anthill ? {ctx, ...this.buttonsCollection.play.anthillControls.createTrace} : {},
            width: {ctx, ...this.buttonsCollection.play.boardControls.width},
            height: {ctx, ...this.buttonsCollection.play.boardControls.height},
            traceRadius: {ctx, ...this.buttonsCollection.play.boardControls.traceRadius},
            minTrace: {ctx, ...this.buttonsCollection.play.boardControls.minTrace},
            maxTrace: {ctx, ...this.buttonsCollection.play.boardControls.maxTrace},
            loopSize: {ctx, ...this.buttonsCollection.play.boardControls.loopSize},
            createLoop: {ctx, ...this.buttonsCollection.play.boardControls.createLoop},
            networks: this.app.player.ant?.brain ? {ctx, ...this.buttonsCollection.play.anthillControls.networks} : {},
            saveNetworks: {ctx, ...this.buttonsCollection.play.boardControls.saveNetworks},
            loadFromNetworks: {ctx, ...this.buttonsCollection.play.boardControls.loadFromNetworks},
            oscillateMap: {ctx, ...this.buttonsCollection.play.boardControls.oscillateMap},
        } : (menu) ? {
            start: {ctx: this.app.gui.ctx, ...this.buttonsCollection.main_menu.mainMenuControls.start}
        } : (network) ? {
            player: this.app.player.ant ? {ctx, ...this.buttonsCollection.networks.player} : {},
            back: {ctx, ...this.buttonsCollection.networks.back},
            load: {ctx, ...this.buttonsCollection.networks.load},
            save: {ctx, ...this.buttonsCollection.networks.save}
        } : {};

        this.hoverCollection = {};

        // if (this.app.game.state.state === NETWORK) {
        //     this.app.factory.binnacle?.Member.forEach((member, key) => {
        //         this.hoverCollection[member.id] = {
        //             ctx: this.app.gui.ctx,
        //             x: member.x,
        //             y: member.y,
        //             width: member.width,
        //             height: member.height,
        //         }
        //     })
        // }

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
}