import Tools from "./Tools.js";
import Gui from "./gui/Gui.js";
import Camera from "./gui/Camera.js";
import States from "./patterns/State.js";
import Factory from "./patterns/Factory.js";
import Physics from "./components/Physics.js";
import Controls from "./components/Controls.js";

export const LOAD_ENGINE = 'LOAD_ENGINE';
export const LOAD_INITS = 'LOAD_INITS';
export const LOAD_GAME = 'LOAD_GAME';
export const GAME_LOADED = 'GAME_LOADED';

export default class AppMethods {

    constructor(Game) {
        this.state = new States(this, LOAD_ENGINE, [LOAD_ENGINE, LOAD_GAME, GAME_LOADED], 'App');
        this.loadEngine(this, Game);
    }

    loadEngine(app, Game) {
        this.tools = new Tools(this);
        this.factory = new Factory(this);

        this.gui = new Gui(this);
        this.gui.camera = new Camera(this);

        this.physics = new Physics(this);
        this.controls = new Controls(this);

        this.gui.request = requestAnimationFrame(this.animate);

        this.state.setState(LOAD_GAME, 'App');

        this.loadGame(Game)
    }

    loadGame(Game) {
        this.game = new Game(this, () => this.state.setState(GAME_LOADED, 'App'));
    }

    update() {
        // BINNACLE
        for (let key in this.factory.binnacle) {
            for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                (Boolean(this.factory.binnacle[key][i].update)) &&
                this.factory.binnacle[key][i].update();
            }
        }
    }

    draw() {
        for (let key in this.factory.binnacle) {
            for (let i = 0; i < this.factory.binnacle[key].length; i++) {
                (Boolean(this.factory.binnacle[key][i].draw)) &&
                this.factory.binnacle[key][i].draw(this.gui.ctx);
            }
        }
    }

    animate = () => {
        this.gui.camera.begin();
        this.update();
        this.draw();
        this.gui.camera.end(this.animate);
    }
}