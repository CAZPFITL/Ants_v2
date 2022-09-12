import GameLevel from "./utils/components/GameLevel.js";
import Gui from "./utils/gui/Gui.js";
import States from "../../engine/utils/patterns/State.js";
import Player from "./utils/components/Player.js";
import {
    LOAD_GAME_DATA,
    LOAD_GAME_LEVEL,
    GAME_OVER,
    PLAY,
    MAIN_MENU,
    NETWORK
} from "./env.js";
import Maps from "./utils/gui/Maps.js";

export default class Ants2 {
    constructor(app, loadCallback) {
        this.app = app;
        this.useMusicBox = true;
        this.loadCallback = loadCallback;
        this.gui = new Gui(this.app, this);
        this.app.factory.addGameEntity(this.gui);
        this.flags = {
            logStart: 0,
            logFlag: 0,
        };
        this.state = new States(app, this, LOAD_GAME_DATA, [LOAD_GAME_DATA, LOAD_GAME_LEVEL, PLAY, MAIN_MENU, NETWORK]);
        this.app.factory.addGameEntity(this);
        this.maps = new Maps();
    }

    /**
     * Private methods
     */
    #loadData() {
        // Load Player Controls
        this.app.player = new Player(this.app, this);
        // Load Music Box
        this.app.musicBox.addSong([
            {
            name: 'ants_001',
            file: 'assets/audio/ants_001.mp3'
        }, {
            name: 'ants_002',
            file: 'assets/audio/ants_002.mp3'
        }, {
            name: 'ants_003',
            file: 'assets/audio/ants_003.mp3'
        }, {
            name: 'ants_004',
            file: 'assets/audio/ants_004.mp3'
        }
        ]);
        // Load Main song
        // this.app.musicBox.changeSong('ants_004');
        // this.app.musicBox.autoplay();
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
            height: 1800
        })
        this.state.setState(MAIN_MENU);
    }

    #restart() {
        this.app.factory.binnacle = {GameObjects: this.app.factory.binnacle.GameObjects};
    }

    /**
     * Draw and Update methods
     */
    update() {
        (this.state.state === LOAD_GAME_DATA) && this.#loadData();
        (this.state.state === LOAD_GAME_LEVEL) && this.#loadGameLevel();
        // TODO CHANGE THIS - this monster is temporal
        if (
            this.app.game.state.state === 'PLAY' &&
            this.app.factory.binnacle['Anthill'][0].antCounter === 0 &&
            this.state.state !== GAME_OVER
        ) {
            this.app.game.state.setState(GAME_OVER);
            (this.state.state === GAME_OVER) && this.#restart();
        }
    }
}