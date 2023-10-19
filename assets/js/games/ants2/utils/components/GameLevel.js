import Anthill from "../entities/Anthill.js";
import Food from "../entities/Food.js";
import {GAME_OVER, PLAY} from "../../env.js";

export default class GameLevel {
    constructor({app, game, id = 0, width, height, addedRules}) {
        this.app = app;
        this.game = game;
        this.name = 'GameLevel #' + id;
        this.coords = {x: -width / 2, y: -height / 2};
        this.size = {width, height}
        this.color = '#523f32';
        this.addedRules = addedRules;
        this.map = null;
        this.loadEntitiesList = game.constructor.name === 'Ants2' && [
            {
                name: 'Food',
                props: {amount: 2}
            }, {
                name: 'Anthill',
                props: {ants: 3000, free: true, level: this},
            }];
        this.app.factory.addGameEntity(this);
        game.constructor.name === 'Ants2' && this.loadEntities();
    }

    /**
     * Private Methods
     */
    #getBordersEdges() {
        const [topLeft, bottomLeft, topRight, bottomRight] = [
            {x: (-this.size.width) / 2, y: (this.size.height) / 2},
            {x: (-this.size.width) / 2, y: (-this.size.height) / 2},
            {x: (this.size.width) / 2, y: (this.size.height) / 2},
            {x: (this.size.width) / 2, y: (-this.size.height) / 2},
        ];

        class WallPolygon {
            constructor({coords, polygons}) {
                this.coords = coords;
                this.polygons = polygons;
            }
        }

        this.wallPolygons = [
            new WallPolygon({
                coords: {
                    x: 0,
                    y: 0
                },
                polygons: [
                    {x: topLeft.x, y: topLeft.y},
                    {x: topRight.x, y: topRight.y},
                    {x: bottomRight.x, y: bottomRight.y},
                    {x: bottomLeft.x, y: bottomLeft.y},
                ]
            }),
        ];
    }

    /**
     * Load methods
     */
    loadEntities() {
        for (let entity of this.loadEntitiesList) {
            entity?.name && this[entity.name](entity.props);
        }
    }

    #loadOutsideRules() {
        for (let rule of this.addedRules) {
            if (this.app.factory.binnacle[rule.name]) {
                this.app.factory.binnacle[rule.name].forEach(entity => {
                    if (entity instanceof Array) return;
                    rule.rule(entity);
                })
            }
        }
    }

    Food({amount}) {
        for (let i = 0; i < amount; i++) {
            this.app.factory.create(Food, {
                app: this.app,
                size: this.app.tools.random(80, 100),
                bounds: this.size
            });
        }
    }

    Anthill({ants, level, free = false}) {
        let collection = this.app.factory.binnacle['Anthill'] ?? [];
        collection = collection.length
        this.app.factory.create(Anthill, {
            app: this.app,
            game: this.game,
            id: collection + 1,
            level,
            ants,
            free
        });
    }

    update() {
        this.#getBordersEdges();
        this.#loadOutsideRules();
        // if (this.game.constructor.name === 'Ants2Trainer') {
        // }

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