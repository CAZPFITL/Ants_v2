import NeuralNetwork from "./Network.js";
import Sensor from "./Sensor.js";

export default class Ant {
    constructor(props) {
        this.#getModelData(props)
    }

    #getModelData({id, x = 0, y = 0, color = '#000', angle = 0, app}) {
        this.name = 'Ant #' + id;
        this.app = app;
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.color = color;
        this.angle = angle;
        this.speed = 0;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.5;
        this.turnSpeed = 0.05;
        this.polygons = [];
        this.controls = {
            forward: false,
            reverse: false,
            right: false,
            left: false
        }
        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork(this,[
            this.sensor.rayCount,
            6,
            4,
            4
        ]);
    }

    update() {
        this.app.physics.walk(this);
        this.app.gui.createPolygon(this);

        this.sensor.update(this.app.entities);
        const offsets = this.sensor.readings.map(sensor => sensor==null ? 0 : 1 - sensor.offset );
        const outputs = NeuralNetwork.feedForward(offsets, this.brain);
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.polygons[0].x, this.polygons[0].y);

        for (let i = 1; i < this.polygons.length; i++) {
            ctx.lineTo(this.polygons[i].x, this.polygons[i].y);
        }

        ctx.fillStyle = this.color;
        ctx.fill();

        this.app.showSensors && this.sensor.draw(ctx);
    }
}

