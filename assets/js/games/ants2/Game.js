import GameLevel from "./utils/components/GameLevel.js";
import Gui from "./utils/gui/Gui.js";
import States from "../../engine/utils/patterns/State.js";
import Player from "./utils/components/Player.js";

const LOAD_GAME_DATA = 'LOAD_GAME_DATA';
const LOAD_GAME_LEVEL = 'LOAD_GAME_LEVEL';
const GAME_OVER = 'GAME_OVER';
const MAIN_MENU = 'MAIN_MENU';
const PLAY = 'PLAY';
export const STOP = 'STOP';

export default class Game {
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
        // Load Music Box
        this.app.musicBox.addSong({
            name: 'test',
            file: 'assets/audio/001.mp3'
        });
        // Load Main song
        this.app.musicBox.changeSong('test');
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
            width: 2000,
            height: 1200
        })
        this.state.setState(MAIN_MENU);
        // this.state.setState(PLAY);
    }

    #gameOver() {
        this.app.factory.binnacle = { GameObjects: this.app.factory.binnacle.GameObjects };
    }

    /**
     * Draw and Update methods
     */
    update() {
        (this.state.state === LOAD_GAME_DATA) && this.#loadData();
        (this.state.state === LOAD_GAME_LEVEL) && this.#loadGameLevel();
        // TODO CHANGE THIS - this monster is temporal
        (this.app.game.state.state === 'PLAY' &&
            this.app.factory.binnacle['Anthill'][0].antCounter === 0 &&
                    this.state.state !== GAME_OVER) && this.app.game.state.setState('GAME_OVER');

        (this.state.state === GAME_OVER) && this.#gameOver();
    }
}