import Food from './utils/entities/Food.js';
import Anthill from "./utils/entities/Anthill.js";
import GameLevel from "./utils/components/GameLevel.js";
import Gui from "./utils/gui/Gui.js";
import States from "../engine/utils/patterns/State.js";
import Player from "./utils/components/Player.js";

const LOAD_GAME_DATA = 'LOAD_GAME_DATA';
const GAME_DATA_LOADED = 'GAME_DATA_LOADED';
const PLAY = 'PLAY';

export default class Game {
    constructor(app, loadCallback) {
        this.app = app;
        this.loadCallback = loadCallback;
        this.gui = new Gui(this.app, this);
        this.app.factory.addGameEntity(this.gui);
        this.state = new States(this, LOAD_GAME_DATA, [LOAD_GAME_DATA, PLAY], 'Game');
        this.app.factory.addGameEntity(this);
    }
    // TODO IMPROVE THIS LOADING SCRIPT
    #loadData() {
        // Load Player Controls
        this.app.player = new Player(this.app);

        this.level = this.app.factory.create(GameLevel, {
            app,
            game: this,
            width: 2000,
            height: 1200
        })

        this.app.controls.addListeners();

        this.loadCallback();

        this.state.setState(GAME_DATA_LOADED, 'Game');
    }

    update() {
        (this.state.state === LOAD_GAME_DATA) && this.#loadData();
        (this.state.state === GAME_DATA_LOADED) && this.state.setState(PLAY, 'Game');
    }

}