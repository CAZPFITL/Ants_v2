import Anthill from "./Anthill.js";
import Food from "./Food.js";

export default class GameLevel {
    constructor({app, game, id = 0, width, height}) {
        this.app = app;
        this.game = game;
        this.name = 'GameLevel #' + id;
        this.entities = [];
        this.coords = { x: -width / 2, y: -height / 2 };
        this.size = { width, height}
        this.color = '#523f32';
        this.#loadEntities();
        this.app.factory.addGameEntity(this);
    }

    #loadEntities(width = 1000, height = 1000) {
        this.loadFood(2, {width, height});
        this.loadAnthill(1);
    }

    loadAnthill(ants = 1) {
        this.game.anthill = this.app.factory.create(Anthill, {
            app: this.app,
            ants: 1
        });
    }

    loadFood(amount = 1, {width, height}) {
        for (let i = 0; i < 2; i++) {
            this.app.factory.create(Food, {
                app: this.app,
                bounds: { width: width / 2, height: height / 2 }
            });
        }
    }

    /**
     * In game draw section
     */
    draw() {
        // TODO change this to draw the level
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
    }
}