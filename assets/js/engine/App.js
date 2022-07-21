import AppMethods from './utils/general/AppMethods.js';
import Ants from '../game/Game.js';
export default class App extends AppMethods {
    constructor(onWindow) {
        super();
        this.loadGame(onWindow);
    }

    loadGame(onWindow) {
        this.loadEngine(this, Ants);
        (onWindow) && (window.app = this);
    }
}
// TODO make a state pattern for the engine