import NeuralNetwork from "../../../../engine/utils/components/Network.js";
import Sensor from "../../../../engine/utils/components/Sensor.js";

export default class Ant {
    constructor({app, id, x = 0, y = 0, color = '#000', angle = 0, anthill}) {
        this.home = anthill;
        this.app = app;
        this.id = id;
        this.no_update = false;
        this.no_draw = false;
        const size = app.tools.random(8, 16);
        this.carryRate = app.tools.random(size * 0.8, size * 1.2) * 0.005;

        this.x = x;
        this.y = y;
        this.color = color;
        this.height = size,
        this.width = size * 0.5,
        this.maxFoodPickCapacity = size * 2;
        this.pickedFood = 0;
        this.hunger = 10;
        this.metabolismSpeed = 0.01;

        this.speed = 0;
        this.angle = angle;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.7;
        this.turnSpeed = 0.05;

        this.polygons = [];
        this.mouth = { x, y };
        this.foodFound = false;
        this.anthillFound = false;

        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0,
            pick: 0,
        }

        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork(this, [
            this.sensor.rayCount + 1, // #inputs
            6, // first layer
            4, // second layer
            4 + 1  // outputs
        ]);
    }

    /**
     * Private
     */
    #neuralProcess() {
        const offsets = this.sensor.readings.map(sensor => sensor == null ? 0 : 1 - sensor.offset);
        const outputs = NeuralNetwork.feedForward([...offsets, Number(this.foodFound), Number(this.anthillFound)], this.brain);

        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
        this.controls.pick = outputs[4];
    }

    #smell() {
        this.mouth = {
            x: this.polygons[1].x,
            y: this.polygons[1].y
        }

        this.foodFound = this.app.gui.get.entityAt(this.mouth, this.app.factory.binnacle.Food || false);
        this.anthillFound = this.app.gui.get.entityAt(this.mouth, this.app.factory.binnacle.Anthill || false);
        const action = this.app.controls.getControls(this).pick;
        this.foodFound && Boolean(action) && this.#carryFood();
        this.anthillFound && this.pickedFood > 0 && Boolean(action) && this.#dropFood();
    }

    #carryFood() {
        const food = this.app.gui.get.entityAt(this.mouth, this.app.factory.binnacle['Food']);
        const capacityAvailable = this.maxFoodPickCapacity >= this.pickedFood;

        food && capacityAvailable && (food.amount -= this.carryRate);
        food && capacityAvailable && (this.pickedFood += this.carryRate);
    }

    #dropFood() {
        const anthill = this.app.gui.get.entityAt(this.mouth, this.app.factory.binnacle['Anthill']);
        const capacityAvailable = this.pickedFood >= 0;


        anthill && capacityAvailable && (anthill.food += this.carryRate);
        anthill && capacityAvailable && (this.pickedFood -= this.carryRate);

        if (this.pickedFood < this.carryRate) {
            this.app.factory.binnacle['Anthill'][0].food += this.pickedFood;
            this.pickedFood = 0;
        }
    }

    #metabolism() {
        this.hunger -= this.metabolismSpeed;
        if (this.hunger <= 0) this.home.removeAnt(this);
    }

    #readMovement() {
        const controls = this.app.controls.getControls(this);

        controls.forward && this.app.physics.speedup(this);
        controls.reverse && this.app.physics.slowdown(this);
        controls.left && this.app.physics.turnLeft(this);
        controls.right && this.app.physics.turnRight(this);
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

    update() {
        if (!this.no_update) {
            this.app.gui.get.createPolygon(this);
            this.sensor.update([
                ...this.app.factory.binnacle.Food,
                ...this.app.factory.binnacle.Ant
            ]);
            this.#neuralProcess();
            this.#smell();
            this.#metabolism();
            this.#readMovement();
            this.app.physics.move(this);
        }
    }

    draw(ctx) {
        if (!this.no_draw) {
            this.app.gui.get.drawPolygon(ctx, this);
            this.sensor.draw(ctx);
        }
    }
}

