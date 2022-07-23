import Food from './utils/entities/Food.js';
import Anthill from "./utils/entities/Anthill.js";
import GameLevel from "./utils/components/GameLevel.js";
import Gui from "./utils/gui/Gui.js";
import States from "../engine/utils/patterns/State.js";
import Player from "./utils/components/Player.js";

const MAIN_MENU = 'MAIN_MENU';
const LOAD_GAME_DATA = 'LOAD_GAME_DATA';
const LOAD_GAME_LEVEL = 'LOAD_GAME_LEVEL';
const GAME_DATA_LOADED = 'GAME_DATA_LOADED';
const PLAY = 'PLAY';

export default class Game {
    constructor(app, loadCallback) {
        this.app = app;
        this.loadCallback = loadCallback;
        this.gui = new Gui(this.app, this);
        this.app.factory.addGameEntity(this.gui);
        this.state = new States(this, LOAD_GAME_DATA, [LOAD_GAME_DATA, LOAD_GAME_LEVEL, PLAY, MAIN_MENU], 'Game');
        this.app.factory.addGameEntity(this);
    }

    #loadData() {
        // Load Player Controls
        this.app.player = new Player(this.app);

        this.app.controls.addListeners();

        this.loadCallback();

        this.state.setState(LOAD_GAME_LEVEL, 'Game')
    }

    #loadGameLevel() {
        this.level = this.app.factory.create(GameLevel, {
            app,
            game: this,
            width: 2000,
            height: 1200
        })
        this.state.setState(PLAY, 'Game');
    }


    update() {
        (this.state.state === LOAD_GAME_DATA) && this.#loadData();

        (this.state.state === LOAD_GAME_LEVEL) && this.#loadGameLevel();

        (this.state.state === GAME_DATA_LOADED) && this.state.setState(PLAY, 'Game');
    }

}