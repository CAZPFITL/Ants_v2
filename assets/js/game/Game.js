import Food from './Food.js';
import Anthill from "./Anthill.js";

export default class Game {
    constructor(app) {
        this.app = app;
        this.#loadEntities();
        this.app.player.entity = this.app.anthill.population[0];
        this.app.state.setState('play');
    }

    // TODO move this to the state "play"
    #loadEntities(width = 1000, height = 1000) {        // this creates the anthill and the ants
        this.app.anthill = this.app.factory.create(Anthill, {
            app: this.app,
            ants: 1
        });
        for (let i = 0; i < 2; i++) {
            this.app.factory.create(Food, {
                app: this.app,
                bounds: { width: width / 2, height: height / 2 }
            });
        }
        this.app.anthill.fillPopulation();
    }
}