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
} from "./../ants2/env.js";

export default class Ants2Trainer {
    constructor(app, loadCallback) {
        this.app = app;
        this.loadCallback = loadCallback;
        this.gui = new Gui(this.app, this);
        this.app.factory.addGameEntity(this.gui);
        this.state = new States(this, LOAD_GAME_DATA, [LOAD_GAME_DATA, LOAD_GAME_LEVEL, PLAY, MAIN_MENU]);
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
                    const inmovilityRadius = 30;

                    // DIE ON BOUNDS
                    if (this.app.physics.isInBound(entity)) {
                        console.log('DIE ON BOUNDS');
                        entity.home.removeAnt(entity);
                    }

                    // DIE ON INMOVILITY
                    if (entity.age < 1 && !entity.requestFlags.startup) {
                        entity.requestFlags.startup = { x: entity.x, y: entity.y };
                    }
                    if (entity.age > 0) {
                        const { x, y } = entity.requestFlags.startup;
                        const limits = {
                            top: y - inmovilityRadius, bottom: y + inmovilityRadius,
                            left: x - inmovilityRadius, right: x + inmovilityRadius,
                        }
                        if (
                            entity.x < limits.right && entity.x > limits.left &&
                            entity.y < limits.bottom && entity.y > limits.top && entity.age > 1
                        ) {
                            console.log('DIE ON INMOVILITY');
                            entity.home.removeAnt(entity);
                        }
                    }

                    // INMORTALITY FOR TESTS
                    if (entity.age > 100) {
                        entity.age = 100;
                    }
                    if (entity.energy < 100) {
                        entity.energy = 100;
                    }
                }
            }]
        })
        this.state.setState(MAIN_MENU);
    }

    restart() {
        this.app.player.ant = null;
        this.app.player.anthill = null;
        this.app.factory.binnacle = { GameObjects: this.app.factory.binnacle.GameObjects };
    }

    /**
     * Draw and Update methods
     */
    update() {
        (this.state.state === LOAD_GAME_DATA) && this.#loadData();
        (this.state.state === LOAD_GAME_LEVEL) && this.#loadGameLevel();
    }
}