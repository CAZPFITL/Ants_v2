import AppMethods from './utils/AppMethods.js';
import GameLevel from "../game/GameLevel.js";

export default class App extends AppMethods {
    constructor(onWindow) {
        super();
        this.loadGame(onWindow);
        this.gpu = new GPU();
    }

    loadGame(onWindow) {
        this.inits = [
            () => this.factory.addGameEntity(this.gui),
            () => this.level = this.factory.create(GameLevel, {
                app: this,
                width: 2000,
                height: 1200
            })
        ];
        this.loadEngine(this);
        (onWindow) && (window.app = this);
    }
}
