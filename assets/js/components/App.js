import AppMethods from './AppMethods.js';
import Anthill from './Anthill.js';
import GameLevel from "./GameLevel.js";

export default class App extends AppMethods {
    constructor(onWindow) {
        super();
        this.loadGame(onWindow);
    }

    loadGame(onWindow) {
        this.inits = [
            () => this.factory.addGameEntity(this.gui),
            () => this.level = this.factory.create(GameLevel, {
                app: this,
                width: 400,
                height: 400
            }),
            () => this.anthill = this.factory.create(Anthill, {
                app: this,
                ants: 3
            }),
        ];
        this.loadEngine(this);
        (onWindow) && (window.app = this);
    }

    animate = () => {
        this.camera.begin();
        this.updateEntities();
        this.drawEntities();
        this.camera.end(this.animate);
    }
}
