import State from "./../../../../engine/utils/patterns/State.js";
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
        // Measurements
        const size = app.tools.random(8, 10);
        this.color = color;
        this.coords = {x, y};
        this.size = {
            width: (size * 0.5),
            height: (size * 1)
        }
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
        // referencable objects
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.6;
        this.turnSpeed = 0.05;
        this._acceleration = this.acceleration;
        this._friction = this.friction;
        this._maxSpeed = this.maxSpeed;
        this._turnSpeed = this.turnSpeed;
        this.target = {x: 0, y: 0};
        this.selfMoveState = new State(this.app, this, 'think', [
            'think',
            'search',
            'lead',
            'follow',
            'running away',
            'eating',

        ], (fn) => fn())
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
            run: 0,
            selfMove: true // is player controlling? = 0
        }
        this.sensors = {
            antennas: new Sensor(
                this,
                2,
                50,
                Math.PI * 0.35,
                this.color
            )
        }

        // NEURAL PROCESS IS DEPRECATED AT THIS POINT, it will be implemented on unity future version.
        // this.brain = new Brain([
        //     {
        //         id: 'follow trace with nose',
        //         neuronCount: [
        //             this.sensors.eyes.rayCount, // inputs
        //             6, // neurons in first layer
        //             8, // neurons in second layer
        //             10, // neurons in third layer
        //             8, // neurons in second layer
        //             6, // neurons in third layer
        //             4
        //         ],
        // ], this.controls);
        // this.brain = new Brain([], this.controls);
    }

    /**
     * Private methods
     */
    #neuralProcess() {
        // FALLBACK TO CATCHER
        const controls = this.player ? this.app.controls.getControls(this) : this.controls;

        // SET SELF MOVE ?
        this.controls.selfMove = !(this.app.player.ant === this);

        // THINK
        // (this.controls.selfMove === 0) && this.brain.think();

        // PERCEIVE
        this.#smell();

        // EXIST
        controls.mark && this.#mark();
        controls.pick && this.#carryFood();
        controls.eat && this.#eatFood();
        controls.drop && this.#dropFood();

        // LIVE
        this.#move(controls);
        this.#metabolism(controls);
        this.#age();
    }

    #smell() {
        this.sensors.antennas.update([
            ...(this.app.factory.binnacle['Traces'][0]?.collection ?? []),
            ...(this.app.factory.binnacle.Food ?? []),
            ...this.app.game.level.wallPolygons
        ]);

        // check if the ants mouth is in the food source,
        this.nose = {
            x: this.polygons[1].x,
            y: this.polygons[1].y
        }

        // THIS UPDATES THE ANTHILL FOUND. loop through all found able objects
        this.anthillFound = this.app.gui.get.entityAt(this.nose, this.app.factory.binnacle['Anthill']);
        this.foundFood = this.app.gui.get.entityAt(this.nose, this.app.factory.binnacle['Food']);
    }

    #eatFood() {
        // do we have something to eat?
        if (!(this.pickedFood > 1 && this.energy < 100)) return;

        // yes we have, lets eat. and update energy and food amounts.
        (this.pickedFood > 0 && this.energy <= 100) && (this.energy += this.eatingRate * 5 * this.app.gameSpeed);
        (this.pickedFood > 0 && this.energy <= 100) && (this.pickedFood -= this.eatingRate * this.app.gameSpeed);
    }

    #mark() {
        if (!this.app.factory.binnacle?.Traces) return; // safe thing.

        // go ahead, trace it up.
        this.app.factory.binnacle.Traces[0].markTrace({
            x: this.coords.x,
            y: this.coords.y
        }, {
            min: 20,
            max: 20,
            spreadMark: 1
        });
    }

    #carryFood() {
        // can we carry more food?
        if (!(this.foundFood && this.maxFoodPickCapacity >= this.pickedFood)) return;

        // yes, we can. then update the food and the picked food amounts.
        this.foundFood.amount -= this.carryRate * this.app.gameSpeed;
        this.pickedFood += this.carryRate * this.app.gameSpeed;
    }

    #dropFood() {
        // do we have something to trow?
        if (!this.pickedFood > 0) return;

        // yes, we can. then drop the food and update the amounts
        (this.anthillFound) && (this.anthillFound.food += this.pickedFood * this.app.gameSpeed);
        this.pickedFood = 0;
    }

    #age() {
        // can we age?
        if (this.app.request - (this.requestFlags.age ?? 0) < (500 / this.app.gameSpeed)) return;

        // yes, we can. then age the ant and update the amounts
        this.requestFlags.age = this.app.request;
        this.age += 1;

        // are we dying by age?
        if (this.age > this.maxAge) {
            this.home.removeAnt(this);
            this.energy = 0;
        }
    }

    #metabolism(controls) {
        // living burning calories
        this.energy -= (!controls.forward && !controls.reverse && !controls.left && !controls.right)
            ? this.metabolismSpeed
            : this.metabolismSpeed * 1.5 * this.app.gameSpeed;

        // running burning calories
        if (controls.forward) this.energy -= 0.003 * this.app.gameSpeed;
        if (controls.run) this.energy -= 0.006 * this.app.gameSpeed;

        // are we dying by tiredness? :(
        if (this.energy <= 0) {
            this.home.removeAnt(this);
            this.energy = 0;
        }
    }

    #move(controls) {
        // update referencable data
        this.acceleration = this._acceleration * this.app.gameSpeed;
        this.turnSpeed = this._turnSpeed * this.app.gameSpeed
        this.maxSpeed = this._maxSpeed * this.app.gameSpeed;
        this.friction = this._friction / this.app.gameSpeed;

        // THIS SCRIPT ALLOWS THE SELF MOVING ANTS TO GO IN ONE SPECIFIC DIRECTION.
        if (this.controls.selfMove) {
            // d=√((x2 – x1)² + (y2 – y1)²)
            this.distanceToTarget = Math.sqrt(Math.pow(this.coords.x - this.home.target.x, 2) + Math.pow(this.coords.y - this.home.target.y, 2))

            // Calculate direction to target selected.
            const x = this.coords.x - this.home.target.x;
            const y = this.coords.y - this.home.target.y;
            const angle = this.angle - Math.atan2(x, y);
            const adjust = Boolean((angle < 0 ? angle * -1 : angle) > 3);

            const delta = !adjust ? (this.angle > Math.atan2(x, y) ? this.angle - this.turnSpeed : this.angle + this.turnSpeed) : -this.angle + this.turnSpeed;

            this.angle = this.app.tools.lerp(delta, delta < 0 ? delta + 1 : delta - 1, 0.01);
            this.speed = this.distanceToTarget / 10;

        } else {
            // Trigger Movement
            if (controls.reverse) this.app.physics.slowdown(this);
            if (controls.left) this.app.physics.turnLeft(this);
            if (controls.right) this.app.physics.turnRight(this);
            if (controls.forward) this.app.physics.speedup(this);
            this.maxSpeed = (controls.run) ? (this.maxSpeed * 2) : this.maxSpeed;
        }

        // LISTED COLLISION OBJECTS
        this.app.physics.move(this, [
            ...this.app.game.level.wallPolygons ?? []
        ]);
    }

    #highlight() {
        if (this.app.game.constructor.name === 'Ants2') {
            this.color = (this.app.player.ant === this) ? 'rgb(0,0,0)' : 'rgba(0,0,0,0.8)';
        }
        if (this.app.game.constructor.name === 'Ants2Trainer') {
            this.color = (this.app.player.ant === this) ? 'rgb(0,150,234)' : 'rgba(0,0,0,0.3)';
        }
    }

    shape() {
        const rad = Math.hypot(this.size.width, this.size.height) / 2;
        const alpha = Math.atan2(this.size.width, this.size.height);
        return [
            {
                x: this.coords.x - Math.sin(this.angle - alpha) * rad,
                y: this.coords.y - Math.cos(this.angle - alpha) * rad
            },
            {
                x: this.coords.x - Math.sin(this.angle) * rad * 0.9,
                y: this.coords.y - Math.cos(this.angle) * rad * 0.9
            },
            {
                x: this.coords.x - Math.sin(this.angle + alpha) * rad,
                y: this.coords.y - Math.cos(this.angle + alpha) * rad
            },
            {
                x: this.coords.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.coords.y - Math.cos(Math.PI + this.angle - alpha) * rad
            },
            {
                x: this.coords.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.coords.y - Math.cos(Math.PI + this.angle + alpha) * rad
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

