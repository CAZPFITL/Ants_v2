import NeuralNetwork from "../../../../engine/utils/components/Network.js";
import Sensor from "../../../../engine/utils/components/Sensor.js";
import {GAME_OVER, PLAY} from "../../env.js";

export default class Ant {
    constructor({app, game, id, x = 0, y = 0, color = '#000', angle = 0, anthill}) {
        this.home = anthill;
        this.app = app;
        this.game = game;
        this.id = id;
        // Booleans
        this.no_update = false;
        this.no_draw = false;
        this.foodFound = false;
        this.anthillFound = false;
        // Measurements
        const size = app.tools.random(8, 16);
        this.x = x;
        this.y = y;
        this.color = color;
        this.height = size;
        this.width = size * 0.5;
        // State and capabilities
        this.metabolismSpeed = 0.005;
        this.energy = 100;
        this.pickedFood = 0;
        this.maxFoodPickCapacity = size * 2;
        this.carryRate = app.tools.random(size, size * 2) * 0.008;
        this.eatingRate = app.tools.random(size, size * 3) * 0.008;
        this.searchTrace = [];
        // physics
        this.speed = 0;
        this.angle = angle;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.6;
        this.turnSpeed = 0.05;
        // Shape
        this.polygons = [];
        this.mouth = {x, y};

        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0,
            pick: 0,
            drop: 0,
            eat: 0,
            run: 0,
            mark: 0
        }

        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork(this, [
            this.sensor.rayCount + 3, // #inputs (sensor and mouth)
            6, // first layer
            4, // second layer
            8  // outputs (forward, left, right, reverse, pick, drop, run, eat)
        ]);
    }

    /**
     * Private methods
     */
    #neuralProcess() {
        const offsets = this.sensor.readings.map(sensor => sensor == null ? 0 : 1 - sensor.offset);
        const outputs = NeuralNetwork.feedForward([
            ...offsets,
            Number(this.foodFound),
            Number(this.anthillFound),
            Number(this.energy / 100)
        ], this.brain);

        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
        this.controls.pick = outputs[4];
        this.controls.drop = outputs[5];
        this.controls.run = outputs[5];
        this.controls.eat = outputs[6];

        this.#smell();
    }

    #smell() {
        this.mouth = {
            x: this.polygons[1].x,
            y: this.polygons[1].y
        }

        this.foodFound = this.app.gui.get.entityAt(
            this.mouth,
            this.app.factory.binnacle.Food || false
        );

        this.anthillFound = this.app.gui.get.entityAt(
            this.mouth,
            this.app.factory.binnacle.Anthill || false
        );
    }

    #move() {
        // Here lies the carry, drop, eat and any physical restrictions
        // like pick while move forwards or drop food out of the anthill,
        // ants don't do that -.-
        const limits = this.app.game.level.size;
        const controls = this.app.controls.getControls(this);
        const {x, y} = this.app.physics.move(this);

        // Trigger Movement
        if (controls.reverse) this.app.physics.slowdown(this);

        if (controls.left) this.app.physics.turnLeft(this);

        if (controls.right) this.app.physics.turnRight(this);

        if (controls.forward) {
            this.app.physics.speedup(this);
            this.energy -= 0.003;
        }

        // TODO physics run
        if (controls.run) {
            this.maxSpeed = 1.2;
            this.energy -= 0.006;
        } else {
            this.maxSpeed = 0.6;
        }

        if (controls.mark) this.#mark();
        // Limit Movement
        // TODO: Move this to physics as world limits
        (this.x > -limits.width / 2 && this.x < limits.width / 2)
            ? (this.x -= x) :
                (this.x -= this.x > 0 ? 0.1 : -0.1);

        (this.y > -limits.height / 2 && this.y < limits.height / 2)
            ? (this.y -= y) :
                (this.y -= this.y > 0 ? 0.1 : -0.1);

        // Eat Food
        if (controls.eat && this.pickedFood > 0) {
            this.#eatFood();
            controls.pick = 0;
        }

        // Pick Food
        if (controls.pick && this.foodFound && !controls.forward) {
            this.#carryFood();
            controls.eat = 0;
        }

        // Drop Food
        if (controls.drop) {
            this.#dropFood();
        }

        // Limit Pick
        this.game.gui.screen.buttons.play.pick = Number(this.foodFound && controls.pick);

        // Burn some calories
        this.metabolismSpeed = (!controls.forward && !controls.reverse && !controls.left && !controls.right) ? 0.004 : 0.008;
    }

    #mark() {
        if (this.app.request - (this.requestFlag ?? 0) > this.app.tools.random(10, 50)) {
            this.requestFlag = this.app.request;
            this.searchTrace.push({
                x: this.app.tools.random(this.x - 2,this.x + 2, false),
                y: this.app.tools.random(this.y - 2,this.y + 2, false),
                radius: this.app.tools.random(1,2, false)
            });
        }

    }

    #highlight() {
        this.color = (this.app.player.ant === this) ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.6)';
    }

    #eatFood() {
        (this.pickedFood > 0 && this.energy <= 100) && (this.energy += this.eatingRate * this.app.tools.random(1.5, 2));
        (this.pickedFood > 0 && this.energy <= 100) && (this.pickedFood -= this.eatingRate);
    }

    #carryFood() {
        const food = this.app.gui.get.entityAt(this.mouth, this.app.factory.binnacle['Food']);
        const capacityAvailable = this.maxFoodPickCapacity >= this.pickedFood;

        food && capacityAvailable && (food.amount -= this.carryRate);
        food && capacityAvailable && (this.pickedFood += this.carryRate);
    }

    #dropFood() {
        const anthill = this.app.gui.get.entityAt(this.mouth, this.app.factory.binnacle['Anthill']);
        (anthill && this.pickedFood > 0) && (anthill.food += this.pickedFood);
        this.pickedFood = 0;
    }

    #metabolism() {
        this.energy -= this.metabolismSpeed;
        if (this.energy <= 0) {
            this.home.removeAnt(this);
            this.energy = 0;
        }
    }
    /**
     * In games draw section
     */
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

    drawTrace() {
        for (let i = 0; i < this.searchTrace.length; i++) {
            // draw circle of random radius
            this.app.gui.ctx.fillStyle = 'rgba(255,207,0,0.34)';
            this.app.gui.ctx.beginPath();
            this.app.gui.ctx.arc(
                this.searchTrace[i].x,
                this.searchTrace[i].y,
                this.searchTrace[i].radius,
                0,
                2 * Math.PI);
            this.app.gui.ctx.fill()
        }
    }
    update() {
        if (!this.no_update && this.app.game.state.state === PLAY || this.app.game.state.state === GAME_OVER) {
            // Draw me
            this.app.gui.get.createPolygon(this);
            // Sensing -.-
            this.sensor.update([
                // What can I find?
                ...this.app.factory.binnacle.Food,
                ...this.app.factory.binnacle.Ant
            ]);
            // Let's think
            this.#neuralProcess();
            // Let's burn fuel
            this.#metabolism();
            // Let's move
            this.#move();
            // Let's highlight
            this.#highlight();
        }
    }

    draw(ctx) {
        this.drawTrace();
        if (!this.no_draw && this.app.game.state.state === PLAY) {
            this.app.gui.get.drawPolygon(ctx, this);
            // this.sensor.draw(ctx);
        }
    }
}

