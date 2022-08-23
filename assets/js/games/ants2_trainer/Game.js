import GameLevel from "./../ants2/utils/components/GameLevel.js";
import NeuralNetwork from "../ants2/utils/components/Network.js";
import Player from "./../ants2/utils/components/Player.js";
import Gui from "./../ants2/utils/gui/Gui.js";

import Tester from "./utils/components/Tester.js";
import States from "../../engine/utils/patterns/State.js";

import {
    LOAD_GAME_DATA,
    LOAD_GAME_LEVEL,
    PLAY,
    MAIN_MENU,
    NETWORK
} from "../ants2/env.js";

export default class Ants2Trainer {
    constructor(app, loadCallback) {
        this.app = app;
        this.loadCallback = loadCallback;
        this.gui = new Gui(this.app, this);
        this.flags = {
            logStart: 0,
            logFlag: 0,
            logCounter: 0,
            antLooper: 50,
            antLooperFlag: 0,
            oscillation: 0,
            oscillationCounter: 0,
        };
        this.bestAnt = null;
        this.app.factory.addGameEntity(this.gui);
        this.state = new States(app, this, LOAD_GAME_DATA, [LOAD_GAME_DATA, LOAD_GAME_LEVEL, PLAY, MAIN_MENU, NETWORK]);
        this.app.factory.addGameEntity(this);

        // this.app.factory.create(FamilyTree,{
        //     app: this.app
        // })
    }

    /**
     * Private methods
     */
    #loadData() {
        // Load Player Controls
        this.app.player = new Player(this.app, this);
        // load Controls listeners
        this.app.controls.addListeners();
        // Run Load Callback From Engine
        this.loadCallback();
        // Set State to LOAD_GAME_LEVEL
        this.state.setState(LOAD_GAME_LEVEL)
    }

    #loadGameLevel() {
        this.level = new GameLevel({
            app,
            game: this,
            width: 200,
            height: 200,
            addedRules: [{
                name: 'Ant',
                rule: (entity) => {
                    const checkRestrictions = (entity) => {
                        // CHECK PLAY STATE & SET INFINITE ENERGY AND NO AGING FOR TESTS
                        if (this.state.state !== PLAY) return;
                        if (entity.age > 100) entity.age = 100;
                        if (entity.energy < 100) entity.energy = 100;
                    }

                    checkRestrictions(entity);

                    // DIE ON BOUNDS
                    const checkBounds = (entity) => {
                        if (this.app.physics.isInBound(entity)) {
                            this.app.log.registerEvent(
                                `Ant #${entity.id} Died on bounds`,
                                `\x1b[35;1m| Ant #${entity.id} Died on bounds`,
                            );
                            entity.home.removeAnt(entity);
                            return;
                        }
                    }

                    checkBounds(entity);

                    // DIE ON INMOVILITY
                    const speed = 200 / this.app.gameSpeed;
                    const inmovilityRadius = 20;

                    const checkEntity = (entity) => {
                        const y = entity.requestFlags?.position?.y ?? 0;
                        const x = entity.requestFlags?.position?.x ?? 0;

                        const limits = {
                            top: y - inmovilityRadius,
                            bottom: y + inmovilityRadius,
                            left: x - inmovilityRadius,
                            right: x + inmovilityRadius,
                        }

                        this.app.game.state.setState('PAUSE');

                        if (
                            entity.x < limits.right &&
                            entity.x > limits.left &&
                            entity.y < limits.bottom &&
                            entity.y > limits.top &&
                            entity.age > 1
                        ) {
                            this.app.log.registerEvent(
                                `Ant #${entity.id} Died on inmovility`,
                                `\x1b[36;1m| Ant #${entity.id} Died on inmovility`,
                            );

                            entity.home.removeAnt(entity);

                            return false;
                        }

                        entity.requestFlags.position = {
                            x: entity.x,
                            y: entity.y
                        };
                    }

                    if (!(this.app.request - (entity.requestFlags?.loop ?? 0) > speed))
                        return;

                    entity.requestFlags.loop = this.app.request;

                    checkEntity(entity);
                }
            }, {
                name: 'Anthill',
                rule: (entity) => {
                    // CREATE LOOP
                    if (entity && this.app.game.gui.screen.abstractStates.looping) {
                        if (entity.antCounter >= this.flags.antLooper) {
                            return;
                        }
                        for (let i = 0; i < this.flags.antLooper; i++) {
                            if (entity.antCounter >= this.flags.antLooper) {
                                continue;
                            }
                            entity.addAnt();
                        }
                    }
                }
            }, {
                name: 'GameObjects',
                rule: (entity) => {
                    if (this.gui.screen.buttonsStates?.oscillateMap === 'click') {
                        if (!(this.app.request - (this.flags?.oscillation ?? 0) > 12)) return;

                        this.flags.oscillation = this.app.request;

                        this.flags.oscillationCounter++;

                        const {a,b} = {
                            a: Math.floor(Tester.oscillate(0.05 * Math.random(), 0.05 * Math.random(), Math.random(), this.flags.oscillationCounter)),
                            b: Math.floor(Tester.oscillate(0.05 * Math.random(), 0.05 * Math.random(), Math.random(), this.flags.oscillationCounter))
                        }

                        this.app.game.level.size.width += a;
                        this.app.game.level.size.height += b;
                        this.app.game.level.coords.x -= a / 2;
                        this.app.game.level.coords.y -= b / 2;
                    }
                }
            }]
        })
        this.state.setState(MAIN_MENU);
    }

    loadFamilyTree() {
        // TODO Move to Family Tree component
        if (localStorage.getItem('familyTree')) {
            for (let i = 0; i < this.app.factory.binnacle.Ant.length; i++) {
                this.app.factory.binnacle.Ant[i].brain = JSON.parse(localStorage.getItem('familyTree'));
                if (i !== 0) {
                    NeuralNetwork.mutate(this.app.factory.binnacle.Ant[i].brain, 0.1);
                }
            }
        }
    }

    saveFamilyTree = () => {
        localStorage.setItem('familyTree', JSON.stringify(this.app.factory.binnacle.FamilyTree[0]));
    }

    // discardFamilyTree = (generation, member) => {
    //     // load and remove the member
    //     localStorage.removeItem('bestBrain');
    // }

    restart() {
        this.app.player.ant = null;
        this.app.player.anthill = null;
        this.app.factory.restart();
    }

    /**
     * Draw and Update methods
     */
    update() {
        (this.state.state === LOAD_GAME_DATA) && this.#loadData();
        (this.state.state === LOAD_GAME_LEVEL) && this.#loadGameLevel();
    }
}