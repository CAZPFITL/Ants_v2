import AppMethods from './utils/AppMethods.js';

export default class App extends AppMethods {
    constructor(onWindow) {
        super();
        this.loadGame(onWindow);
    }

    loadGame(onWindow) {
        this.loadEngine(this);
        (onWindow) && (window.app = this);
    }
}
// TODO make a state pattern for the engine