import Stats from "./gui/Stats.js";
import Camera from "./gui/Camera.js";
import Gui from "./gui/Gui.js";
import Tools from "./helpers/Tools.js";
import States from "./patterns/State.js";
import Factory from "./patterns/Factory.js";
import Physics from "./components/Physics.js";
import Controls from "./components/Controls.js";
import MusicBox from "./components/MusicBox.js";
import {
    LOAD_ENGINE,
    LOAD_GAME,
    PLAY_GAME
} from "../env.js";

export default class AppMethods {
    constructor(Game) {
        this.state = new States(this, LOAD_ENGINE, [LOAD_ENGINE, LOAD_GAME, PLAY_GAME]);
        this.loadEngine(this, Game);
    }

    loadEngine(app, Game) {
        this.tools = Tools;

        this.controls = new Controls(this);
        this.physics = new Physics(this);
        this.factory = new Factory(this);
        this.musicBox = new MusicBox(this);

        this.gui = new Gui(this);
        this.camera = new Camera(app);
        // External Components
        // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats = new Stats()
        this.stats.showPanel( 0 )
        this.stats.isShowing = true;
        document.body.appendChild( this.stats.dom );

        this.request = requestAnimationFrame(this.camera.loop);

        this.loadGame(Game)
    }

    toggleStats() {
        this.stats.isShowing = !this.stats.isShowing;
        this.stats.dom.style.display = this.stats.isShowing ? 'block' : 'none';
    }

    loadGame(Game) {
        this.state.setState(LOAD_GAME);
        this.game = new Game(this, () => this.state.setState(PLAY_GAME));
    }

    update() {
        for (let key in this.factory.binnacle) {
            if (this.factory.binnacle[key] instanceof Array) {
                for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                    (Boolean(this.factory.binnacle[key][i].update)) &&
                    this.factory.binnacle[key][i].update();
                }
            }
        }
    }

    draw() {
        for (let key in this.factory.binnacle) {
            if (this.factory.binnacle[key] instanceof Array) {
                for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                    (Boolean(this.factory.binnacle[key][i].draw)) &&
                    this.factory.binnacle[key][i].draw(this.gui.ctx);
                }
            }
        }
    }
}