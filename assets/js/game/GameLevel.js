import Food from './Food.js';
import Anthill from "./Anthill.js";

export default class GameLevel {
    constructor({app, id = 0, width, height}) {
        this.app = app;
        this.getLevelData({app, id, width, height});
    }

    getLevelData({id, width, height}) {
        this.name = 'GameLevel #' + id;
        this.entities = [];
        this.coords = { x: -width / 2, y: -height / 2 };
        this.size = { width, height}
        this.color = '#523f32';

        this.food = [
            this.app.factory.create(Food, {
                app: this.app,
                x: 200,
                y: 200,
                radius: 20
            }),
            this.app.factory.create(Food, {
                app: this.app,
                x: -200,
                y: 0,
                radius: 20
            }),
            this.app.factory.create(Food, {
                app: this.app,
                x: 200,
                y: 0,
                radius: 20
            }),
            this.app.factory.create(Food, {
                app: this.app,
                x: -200,
                y: -200,
                radius: 20
            }),
            this.app.factory.create(Food, {
                app: this.app,
                x: 200,
                y: -200,
                radius: 20
            }),
            this.app.factory.create(Food, {
                app: this.app,
                x: 0,
                y: -200,
                radius: 20
            }),
            this.app.factory.create(Food, {
                app: this.app,
                x: 0,
                y: 200,
                radius: 20
            }),
            this.app.factory.create(Food, {
                app: this.app,
                x: -200,
                y: 200,
                radius: 20
            }),
        ];
        // this creates the anthill and the ants
        this.app.anthill = this.app.factory.create(Anthill, {
            app: this.app,
            ants: 80
        })
        this.app.factory.addGameEntity(this);
    }

    update() {

    }

    draw() {
        // TODO change this to draw the level
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
    }
}