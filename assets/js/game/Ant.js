import Shape from './Shape.js';
import NeuralNetwork from "./Network.js";
import Sensor from "../engine/utils/Sensor.js";

export default class Ant {
    constructor({app, ...props}) {
        this.app = app;
        this.#getModelData(props)
    }

    /**
     * Private
     */
    #getModelData({id, x = 0, y = 0, color = '#000', angle = 0}) {
        this.name = 'Ant #' + id;
        const size = this.app.tools.random(4, 16);
        this.eatRate = this.app.tools.random(size * 0.08, size * 0.1);

        this.x = x;
        this.y = y;
        this.width = size * 0.5,
        this.height = size,

        this.speed = 0;
        this.color = color;
        this.angle = angle;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.7;
        this.turnSpeed = 0.05;

        this.polygons = [];
        this.mouth = { x, y };
        this.onFood = false;

        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0,
            eat: 0,
        }

        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork(this, [
            this.sensor.rayCount + 1, // #inputs
            6, // first layer
            4, // second layer
            4 + 1  // outputs
        ]);
    }

    #neuralProcess() {
        const offsets = this.sensor.readings.map(sensor => sensor == null ? 0 : 1 - sensor.offset);
        const outputs = NeuralNetwork.feedForward([...offsets, Number(this.onFood)], this.brain);

        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
        this.controls.eat = outputs[4];
    }

    #tasteFood() {
        this.mouth = {
            x: this.polygons[1].x,
            y: this.polygons[1].y
        }
        this.onFood = Boolean(this.app.tools.getEntityAt(this.mouth, this.app.factory.binnacle.Food));
        // Read if AI or user are eating the food
        const eating = this.app.controls.getControls(this).eat;
        (this.onFood && Boolean(eating)) && this.#eatFood();
    }

    #eatFood() {
        const food = this.app.tools.getEntityAt(this.mouth, this.app.factory.binnacle.Food);
        food && (food.amount -= this.eatRate);
    }

    /**
     * In game draw section
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
                x: this.x - Math.sin(this.angle + 0) * rad * 0.9,
                y: this.y - Math.cos(this.angle + 0) * rad * 0.9
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
        this.sensor.update([
            ...this.app.factory.binnacle.Food,
            ...this.app.factory.binnacle.Ant
        ]);
        this.app.gui.createPolygon(this);
        // this.app.gui.createShape(this, Shape.ant());
        this.app.controls.readMovement(this);
        this.app.physics.walk(this);
        this.#neuralProcess();
        this.#tasteFood();
    }

    draw(ctx) {
        this.app.gui.drawPolygon(ctx, this);
        // this.app.showSensors && this.sensor.draw(ctx);
    }
}

