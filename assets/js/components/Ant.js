import NeuralNetwork from "./Network.js";
import Sensor from "../engine/utils/Sensor.js";

export default class Ant {
    constructor(props) {
        this.getModelData(props)
    }

    getModelData({id, x = 0, y = 0, color = '#000', angle = 0, app}) {
        this.name = 'Ant #' + id;
        this.app = app;
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.width = 4;
        this.height = 8;
        this.color = color;
        this.angle = angle;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.5;
        this.turnSpeed = 0.05;

        this.polygons = [];

        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0
        }

        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork(this,[
            this.sensor.rayCount, // #inputs
            6, // first layer
            4, // second layer
            4  // outputs
        ]);
    }

    neuralProcess() {
        const offsets = this.sensor.readings.map(sensor => sensor==null ? 0 : 1 - sensor.offset );
        const outputs = NeuralNetwork.feedForward(offsets, this.brain);

        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
    }

    update() {
        this.sensor.update(this.app.entities);
        this.neuralProcess();
        this.app.player.readMovement(this);
        this.app.physics.walk(this);
        this.app.gui.createPolygon(this);
    }

    draw(ctx) {
        this.app.gui.drawPolygon(ctx, this);
        this.app.showSensors && this.sensor.draw(ctx);
    }
}

