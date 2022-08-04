import GameLevel from "./../ants2/utils/components/GameLevel.js";
import Gui from "./../ants2/utils/gui/Gui.js";
import States from "../../engine/utils/patterns/State.js";
import Player from "./../ants2/utils/components/Player.js";
import {
    LOAD_GAME_DATA,
    LOAD_GAME_LEVEL,
    GAME_OVER,
    PLAY,
    MAIN_MENU,
    NETWORK
} from "./../ants2/env.js";

export default class Ants2Trainer {
    constructor(app, loadCallback) {
        this.app = app;
        this.loadCallback = loadCallback;
        this.gui = new Gui(this.app, this);
        this.flags = {
            antLooper: 100,
            dieRadius: 50,
            logStart: 0,
            logFlag: 0,
            logCounter: 0,
        };
        this.bestAnt = null;
        this.app.factory.addGameEntity(this.gui);
        this.state = new States(app, this, LOAD_GAME_DATA, [LOAD_GAME_DATA, LOAD_GAME_LEVEL, PLAY, MAIN_MENU, NETWORK]);
        this.app.factory.addGameEntity(this);
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
            width: 300,
            height: 600,
            addedRules: [{
                name: 'Ant',
                rule: (entity) => {
                    const inmovilityRadius = this.flags.dieRadius;

                    // INFINITE ENERGY AND NO AGING FOR TESTS
                    if (entity.age > 100) {
                        entity.age = 100;
                    }
                    if (entity.energy < 100) {
                        entity.energy = 100;
                    }

                    // DIE ON BOUNDS
                    if (this.app.physics.isInBound(entity)) {
                        this.app.log.registerEvent(
                            `Ant #${entity.id} Died on bounds`,
                            `\x1b[35;1m| Ant #${entity.id} Died on bounds`,
                        );
                        entity.home.removeAnt(entity);
                        return;
                    }

                    // DIE ON INMOVILITY
                    if (entity.age > 0) {
                        const {x, y} = {x: entity.home.coords.x, y: entity.home.coords.y};
                        const limits = {
                            top: y - inmovilityRadius, bottom: y + inmovilityRadius,
                            left: x - inmovilityRadius, right: x + inmovilityRadius,
                        }
                        if (
                            entity.x < limits.right && entity.x > limits.left &&
                            entity.y < limits.bottom && entity.y > limits.top && entity.age > 1
                        ) {
                            this.app.log.registerEvent(
                                `Ant #${entity.id} Died on inmovility`,
                                `\x1b[36;1m| Ant #${entity.id} Died on inmovility`,
                            );
                            entity.home.removeAnt(entity);
                            return;
                        }
                    }
                }
            }, {
                name: 'Anthill',
                rule: (entity) => {
                    if (entity && this.app.game.gui.screen.buttons.play.looping) {
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
            }]
        })
        this.state.setState(MAIN_MENU);
    }

    loadFamilyTree() {
        if (localStorage.getItem('familyTree')) {
            for (let i = 0; i < this.app.factory.binnacle.Ant.length; i++) {
                this.app.factory.binnacle.Ant[i].brain = JSON.parse(localStorage.getItem('familyTree'));
                if (i != 0) {
                    NeuralNetwork.mutate(this.app.factory.binnacle.Ant[i].brain, 0.1);
                }
            }
        }
    }


    saveFamilyTree = () => {
        localStorage.setItem('familyTree', JSON.stringify(this.app.game.bestAnt.brain));
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