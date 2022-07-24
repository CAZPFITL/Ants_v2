import GameLevel from "./utils/components/GameLevel.js";
import Gui from "./utils/gui/Gui.js";
import States from "../../engine/utils/patterns/State.js";
import Player from "./utils/components/Player.js";

const MAIN_MENU = 'MAIN_MENU';
const LOAD_GAME_DATA = 'LOAD_GAME_DATA';
const LOAD_GAME_LEVEL = 'LOAD_GAME_LEVEL';
const GAME_DATA_LOADED = 'GAME_DATA_LOADED';
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

    #loadData() {
        // Load Player Controls
        this.app.player = new Player(this.app, this);
        // Load Music Box
        this.app.musicBox.addSong({
            name: 'test',
            file: 'assets/audio/001.mp3'
        });
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
        this.state.setState(PLAY);
    }


    update() {
        (this.state.state === LOAD_GAME_DATA) && this.#loadData();

        (this.state.state === LOAD_GAME_LEVEL) && this.#loadGameLevel();

        (this.state.state === GAME_DATA_LOADED) && this.state.setState(PLAY);

        (this.app.factory.binnacle['Anthill'][0].ants === 0) && this.app.game.state.setState('GAME_OVER');
    }

}