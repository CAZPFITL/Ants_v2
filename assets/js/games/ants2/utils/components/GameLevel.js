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
                props: {amount: 0}
            }, {
                name: 'Anthill',
                props: {ants: 1, free: true},
            }];
        game.constructor.name === 'Ants2' && this.loadEntities();
        this.app.factory.addGameEntity(this);
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
        this.boundTargets = {
            // These are the bounds for the ants sensors
            walls: [
                // Left
                {x: topLeft.x, y: topLeft.y},
                {x: bottomLeft.x, y: bottomLeft.y},
                // Right
                {x: topRight.x, y: topRight.y},
                {x: bottomRight.x, y: bottomRight.y},
                // Bottom
                {x: bottomLeft.x, y: bottomLeft.y},
                {x: bottomRight.x, y: bottomRight.y},
                // Top
                {x: topLeft.x, y: topLeft.y},
                {x: topRight.x, y: topRight.y}
            ]
        }

        class WallPolygon {
            constructor({name, type, coords, polygons}) {
                this.name = name;
                this.type = type;
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

    Food({amount, width, height}) {
        width = width ?? this.size.width;
        height = height ?? this.size.height;
        for (let i = 0; i < amount; i++) {
            this.app.factory.create(Food, {
                app: this.app,
                bounds: {width: width / 2, height: height / 2}
            });
        }
    }

    Anthill({ants, free = false}) {
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
        this.#getBordersEdges();
        if (this.game.constructor.name === 'Ants2Trainer') {
            this.#loadOutsideRules();
        }

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