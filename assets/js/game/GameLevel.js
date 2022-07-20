import Food from './Food.js';
import Anthill from "./Anthill.js";

export default class GameLevel {
    constructor({app, id = 0, width, height}) {
        this.app = app;
        this.#getLevelData({app, id, width, height});
    }
    /**
     * Private
     */
    #getLevelData({id, width, height}) {
        this.name = 'GameLevel #' + id;
        this.entities = [];
        this.coords = { x: -width / 2, y: -height / 2 };
        this.size = { width, height}
        this.color = '#523f32';
        this.app.factory.addGameEntity(this);
        this.#loadEntities({width, height})
    }

    // TODO move this to the state "play"
    #loadEntities({width, height}) {
        // this creates the anthill and the ants
        for (let i = 0; i < 4; i++) {
            this.app.factory.create(Food, {
                app: this.app,
                bounds: { width: width / 2, height: height / 2 }
            });
        }
        this.app.anthill = this.app.factory.create(Anthill, {
            app: this.app,
            ants: 1
        });
    }

    /**
     * In game draw section
     */
    update() {}

    draw() {
        // TODO change this to draw the level
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
    }
}