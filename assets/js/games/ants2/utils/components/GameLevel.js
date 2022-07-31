import Anthill from "../entities/Anthill.js";
import Food from "../entities/Food.js";
import {GAME_OVER, PLAY} from "../../env.js";

export default class GameLevel {
    constructor({app, game, id = 0, width, height}) {
        this.app = app;
        this.game = game;
        this.name = 'GameLevel #' + id;
        this.coords = { x: -width / 2, y: -height / 2 };
        this.size = { width, height }
        this.color = '#523f32';
        this.boundTargets = {};
        game.constructor.name === 'Ants2' && this.loadEntities();
        this.app.factory.addGameEntity(this);
    }

    /**
     * Private Methods
     */
    #getBordersEdges() {
        const [ topLeft, bottomLeft, topRight, bottomRight ] = [
            { x: (-this.size.width) / 2, y: (-this.size.height) / 2 },
            { x: (-this.size.width) / 2, y: (this.size.height) / 2 },
            { x: (this.size.width) / 2, y: (- this.size.height) / 2 },
            { x: (this.size.width) / 2, y: (this.size.height) / 2 }
        ];
        this.boundTargets = {
            // These are the bounds for the ants sensors
            polygons: [
                // Left
                topLeft,
                bottomLeft,
                { x: bottomLeft - 1, ...bottomLeft.y },
                { x: topLeft - 1, ...topLeft.y },
                // Right
                topRight,
                bottomRight,
                { x: bottomRight + 1, ...bottomRight.y },
                { x: topRight + 1, ...topRight.y },
                // Top
                topLeft,
                topRight,
                { x: topRight.x, y: topRight.y - 1 },
                { x: topLeft.x, y: topLeft.y - 1 },
                // Bottom
                bottomLeft,
                bottomRight,
                { x: bottomRight.x, y: bottomRight.y + 1 },
                { x: bottomLeft.x, y: bottomLeft.y + 1 }
            ]
        }
    }

    /**
     * Load methods
     */
    loadEntities() {
        this.loadFood(5);
        this.loadAnthill(1, true);
    }

    loadFood(amount = 1, {width, height} = this.size) {
        for (let i = 0; i < amount; i++) {
            this.app.factory.create(Food, {
                app: this.app,
                bounds: { width: width / 2, height: height / 2 }
            });
        }
    }

    loadAnthill(ants, free = false) {
        let collection = this.app.factory.binnacle['Anthill'] ?? [];
        collection = collection.length
        this.app.factory.create(Anthill, {
            app: this.app,
            game: this.game,
            id: collection + 1,
            ants,
            free
        });
    }

    update() {
        // console.log(this.boundTargets)
        this.#getBordersEdges();
    }
    /**
     * Draw and Update methods
     */
    draw() {
        if (this.app.game.state.state === PLAY ||
                this.app.game.state.state === GAME_OVER) {
            // TODO change this to get the level
            this.app.gui.ctx.fillStyle = this.color;
            this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
        }
    }
}