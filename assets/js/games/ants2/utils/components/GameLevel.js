import Anthill from "../entities/Anthill.js";
import Food from "../entities/Food.js";

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
        let collection = this.app.factory.binnacle['Anthill'] ?? [];
        collection = collection.length
        this.app.factory.create(Anthill, {
            app: this.app,
            ants,
            id: collection + 1,
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

    gameLevelDataStrings() {
        // TODO consider to make multiple anthills
        const antHill = this.app.factory.binnacle['Anthill'][0]
        const entity = this.app.player.ant

        if (!antHill || !entity) return

        const {ants, food, player} = {
            ants: antHill.ants ?? "n/a", food: this.app.tools.xDec(antHill.food, 0), player: {
                name: entity.name ?? "No Ant Selected",
                hunger: this.app.tools.xDec(entity.hunger * 10, 2) ?? "n/a",
                maxFoodPickCapacity: entity.maxFoodPickCapacity ?? "n/a",
                maxPickedFood: entity.maxPickedFood ?? "n/a",
                pickedFood: entity.pickedFood ?? "n/a",
            }
        }

        return {
            color: '#000000',
            font: "20px Mouse",
            anthillAnts: `Anthill Ants: ${ants}`,
            anthillFood: `Anthill Food: ${food}`,
            antSelected: `Player: ${player.name}`,
            pickedBarText: `Player: ${player.name} / Food: ${this.app.tools.xDec(player.pickedFood, 0)} / ${this.app.tools.xDec(player.maxFoodPickCapacity, 0)}`,
            hungerText: `${player.name} Hunger: ${player.hunger} / ${100}`,
            entity
        }
    }

    /**
     * In games draw section
     */
    draw() {
        // TODO change this to get the level
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
    }
}