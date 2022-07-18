import NeuralNetwork from "./Network.js";
import Sensor from "../engine/utils/Sensor.js";

export default class Ant {
    constructor({app, ...props}) {
        this.app = app;
        this.getModelData(props)
    }

    getModelData({id, x = 0, y = 0, color = '#000', angle = 0}) {
        this.name = 'Ant #' + id;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.width = 4;
        this.height = 8;
        this.color = color;
        this.angle = angle;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 2.5;
        this.turnSpeed = 0.05;

        this.polygons = [];
        this.mouth = { x, y };
        this.onFood = false;
        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0
        };

        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork(this, [
            this.sensor.rayCount, // #inputs
            6, // first layer
            4, // second layer
            4  // outputs
        ]);
    }

    neuralProcess() {
        this.tasteFood();

        const offsets = this.sensor.readings.map(sensor => sensor == null ? 0 : 1 - sensor.offset);
        const outputs = NeuralNetwork.feedForward([...offsets, Number(this.onFood)], this.brain);

        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
    }


    tasteFood() {
        this.mouth = {
            x: this.polygons[1].x,
            y: this.polygons[1].y
        }
        this.onFood = Boolean(this.app.tools.getEntityAt(this.mouth, this.app.factory.binnacle.Food));
    }
    update() {
        this.sensor.update([
            ...this.app.factory.binnacle.Food,
            ...this.app.factory.binnacle.Ant
        ]);
        this.app.gui.createPolygon(this);
        this.app.player.readMovement(this);
        this.app.physics.walk(this);
        this.neuralProcess();
    }

    draw(ctx) {
        this.app.gui.drawPolygon(ctx, this);
        this.app.showSensors && this.sensor.draw(ctx);
    }
}

