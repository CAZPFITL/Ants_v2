import NeuralNetwork from "../components/Network.js";
import Brain from "../components/Brain.js";
import Sensor from "../components/Sensor.js";
import {GAME_OVER, PLAY} from "../../env.js";

export default class Ant {
    constructor({app, game, id, x = 0, y = 0, color = '#000', angle = 0, anthill}) {
        this.home = anthill;
        this.app = app;
        this.game = game;
        this.id = id;
        this.name = `${id} from ${anthill.id}`
        // Booleans
        this.no_update = false;
        this.no_draw = false;
        this.foodFound = false;
        this.anthillFound = false;
        // Training
        this.isOnBound = false;
        // Measurements
        const size = app.tools.random(8, 16);
        this.x = x;
        this.y = y;
        this.color = color;
        this.height = size;
        this.width = size * 0.5;
        // State and capabilities
        this.age = 0;
        this.maxAge = app.tools.random(400, 600);
        this.eatingRate = app.tools.random(size, size * 3) * 0.008;
        this.carryRate = app.tools.random(size, size * 2) * 0.008;
        this.metabolismSpeed = 0.005;
        this.energy = 100;
        this.pickedFood = 0;
        this.maxFoodPickCapacity = size * 2;
        this.requestFlags = {};
        this.nose = {x, y};
        this.player = Boolean(this.app.player?.controls);
        // physics
        this.speed = 0;
        this.angle = angle;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.6;
        this.turnSpeed = 0.05;
        // Shape
        this.polygons = [];
        // Control
        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0,
            pick: 0,
            drop: 0,
            eat: 0,
            run: 0
        }
        this.sensors = {
            nose: new Sensor(
                this,
                10,
                20,
                Math.PI * 0.8,
                'rgba(255,195,0,0.5)'
            ),
            eyes: new Sensor(
                this,
                4,
                30,
                Math.PI * 0.5,
                'rgba(255,95,120,0.5)'
            ),
            antennas: new Sensor(
                this,
                2,
                20,
                Math.PI * 0.2,
                'rgba(0,0,0,0.5)'
            )
        }
        this.brain = new Brain([
                {
                    id: 'follow trace with nose',
                    neuronCount: [
                        this.sensors.eyes.rayCount, // inputs
                        6, // neurons in first layer
                        8, // neurons in second layer
                        10, // neurons in third layer
                        8, // neurons in second layer
                        6, // neurons in third layer
                        4
                    ],
                    inputs: this.sensors.eyes,
                    outputs: [
                        'forward',
                        'left',
                        'right',
                        'reverse',
                    ]
                },
                {
                    id: 'follow trace with nose',
                    neuronCount: [
                        this.sensors.nose.rayCount, // inputs
                        6, // neurons in first layer
                        8, // neurons in second layer
                        6, // neurons in third layer
                        4
                    ],
                    inputs: this.sensors.nose,
                    outputs: [
                        'forward',
                        'left',
                        'right',
                        'reverse',
                    ]
                },
                {
                    id: 'go away from bounds with nose',
                    neuronCount: [
                        this.sensors.nose.rayCount, // inputs
                        6, // neurons in first layer
                        8, // neurons in second layer
                        6, // neurons in third layer
                        4
                    ],
                    inputs: this.sensors.nose,
                    outputs: [
                        'forward',
                        'left',
                        'right',
                        'reverse',
                    ]
                },
                {
                    id: 'follow trace with antennas',
                    neuronCount: [
                        this.sensors.antennas.rayCount, // inputs
                        6, // neurons in first layer
                        8, // neurons in second layer
                        6, // neurons in third layer
                        4
                    ],
                    inputs: this.sensors.antennas,
                    outputs: [
                        'forward',
                        'left',
                        'right',
                        'reverse',
                    ]
                },
                {
                    id: 'go away from bounds with antennas',
                    neuronCount: [
                        this.sensors.antennas.rayCount, // inputs
                        6, // neurons in first layer
                        8, // neurons in second layer
                        6, // neurons in third layer
                        4
                    ],
                    inputs: this.sensors.antennas,
                    outputs: [
                        'forward',
                        'left',
                        'right',
                        'reverse',
                    ]
                }
            ], this.controls);

        if (this.app.game.gui.screen.buttons.play.loading && this.app.game.LOADED_BRAINS) {
            this.brain.mutate(this.app.game.LOADED_BRAINS, 0.005)
            this.app.log.registerEvent(
                `${this.name} brain mutated`,
                `\x1b[32;1m| \x1b[0m${this.name} \x1b[32;1mBrain\x1b[0m Mutated`
            );
        }
    }

    /**
     * Private methods
     */
    #neuralProcess() {
        const controls = this.player ? this.app.controls.getControls(this) : this.controls;

        this.brain.update(() => {
            // PERCEIVE
            this.#watch();
            this.#touch();
            this.#smell();
            // REACT
            this.#move(controls);
            this.#mark(controls);
            this.#carryFood(controls);
            this.#eatFood(controls);
            this.#metabolism(controls);
            this.#dropFood(controls);
            this.#age();
        });
    }

    #watch() {
        this.sensors.eyes.update([
            ...(this.app.factory.binnacle['Traces'][0]?.collection ?? []),
            this.app.game.level.boundTargets
        ]);
    }

    #touch() {
        this.sensors.antennas.update([
            ...(this.app.factory.binnacle['Traces'][0]?.collection ?? []),
            this.app.game.level.boundTargets
        ]);
    }

    #smell() {
        // this sensors should read for traces
        this.sensors.nose.update([
            // What can I find?
            // ...(this.app.factory.binnacle.Food ?? []),
            // ...(this.app.factory.binnacle.Ant ?? []),
            ...(this.app.factory.binnacle['Traces'][0]?.collection ?? []),
            this.app.game.level.boundTargets
        ]);

        this.nose = {
            x: this.polygons[1].x,
            y: this.polygons[1].y
        }

        this.foodFound = this.app.gui.get.entityAt(
            this.nose,
            this.app.factory.binnacle.Food || false
        );

        this.anthillFound = this.app.gui.get.entityAt(
            this.nose,
            this.app.factory.binnacle.Anthill || false
        );
    }

    #move(controls) {
        // Trigger Movement
        if (controls.reverse) this.app.physics.slowdown(this);
        if (controls.left) this.app.physics.turnLeft(this);
        if (controls.right) this.app.physics.turnRight(this);
        if (controls.forward) {
            this.app.physics.speedup(this);
            this.energy -= 0.003;
        }
        if (controls.run) {
            this.maxSpeed = 1.2;
            this.energy -= 0.006;
        } else {
            this.maxSpeed = 0.6;
        }
        // Make Move
        this.app.physics.move(this)
    }

    #mark(controls) {
        if (!controls.mark || !this.app.factory.binnacle?.Traces)
            return;

        this.app.factory.binnacle.Traces[0].markTrace(this);
    }

    #eatFood(controls) {
        if (!(controls.eat && this.pickedFood > 1 && this.energy < 100)) {
            this.game.gui.screen.buttons.play.eat = 0
            return
        }

        this.game.gui.screen.buttons.play.eat = 1
        controls.pick = 0;

        (this.pickedFood > 0 && this.energy <= 100) && (this.energy += this.eatingRate * 5);
        (this.pickedFood > 0 && this.energy <= 100) && (this.pickedFood -= this.eatingRate);
    }

    #metabolism(controls) {
        this.energy -= (!controls.forward && !controls.reverse && !controls.left && !controls.right)
            ? this.metabolismSpeed
            : this.metabolismSpeed * 1.5;
        if (this.energy <= 0) {
            this.home.removeAnt(this);
            this.energy = 0;
        }
    }

    #carryFood(controls) {
        if (!(controls.pick && this.foodFound && !controls.forward && this.pickedFood < this.maxFoodPickCapacity)) {
            this.game.gui.screen.buttons.play.pick = 0
            return
        }

        this.game.gui.screen.buttons.play.pick = 1;
        controls.eat = 0;

        const food = this.app.gui.get.entityAt(this.nose, this.app.factory.binnacle['Food']);
        const capacityAvailable = this.maxFoodPickCapacity >= this.pickedFood;

        food && capacityAvailable && (food.amount -= this.carryRate);
        food && capacityAvailable && (this.pickedFood += this.carryRate);
    }

    #dropFood(controls) {
        if (!controls.drop) return;
        const anthill = this.app.gui.get.entityAt(this.nose, this.app.factory.binnacle['Anthill']);
        (anthill && this.pickedFood > 0) && (anthill.food += this.pickedFood);
        this.pickedFood = 0;
    }

    #age() {
        if (this.app.request - (this.requestFlags.age ?? 0) < 500) return;
        this.requestFlags.age = this.app.request;
        this.age += 1;
        if (this.age > this.maxAge) {
            this.home.removeAnt(this);
            this.energy = 0;
        }
    }

    #highlight() {
        if (this.app.game.constructor.name === 'Ants2') {
            this.color = (this.app.player.ant === this) ? 'rgb(0,0,0)' : 'rgba(0,0,0,0.35)';
        }
        if (this.app.game.constructor.name === 'Ants2Trainer') {
            this.color = (this.app.player.ant === this) ? 'rgb(0,150,234)' : 'rgba(0,0,0,0.35)';
        }
    }

    shape() {
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        return [
            {
                x: this.x - Math.sin(this.angle - alpha) * rad,
                y: this.y - Math.cos(this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(this.angle) * rad * 0.9,
                y: this.y - Math.cos(this.angle) * rad * 0.9
            },
            {
                x: this.x - Math.sin(this.angle + alpha) * rad,
                y: this.y - Math.cos(this.angle + alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
            }
        ]
    }

    drawAnt(ctx) {
        this.app.gui.get.drawPolygon(ctx, this);
    }

    update() {
        if (!this.no_update && this.app.game.state.state === PLAY || this.app.game.state.state === GAME_OVER) {
            // Draw me
            this.app.gui.get.createPolygon(this);
            // Let's think
            this.#neuralProcess();
            // Let's highlight
            this.#highlight();
        }
    }

    draw(ctx) {
        if (!this.no_draw && this.app.game.state.state === PLAY) {
            this.drawAnt(ctx);
            Object.values(this.sensors).forEach(sensor => {
                sensor.draw(ctx);
            })
        }
    }
}

