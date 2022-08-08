import NeuralNetwork from "../components/Network.js";
import Sensor from "../components/Sensor.js";
import {GAME_OVER, PLAY} from "../../env.js";
import Traces from "./Traces.js";
import Visualizer from '../components/Visualizer.js';

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
        this.maxAge = app.tools.random(100, 200);
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
        this.sensor = new Sensor(this);
        this.brain = new NeuralNetwork(this, [
            this.sensor.rayCount, // #inputs (4 offsets, foodFound and anthillFound)
            6, // first layer
            4, // second layer
            // Object.keys(this.controls).length  // #outputs (forward, left, right, reverse, pick, drop, run, eat)
            4
        ]);
    }

    /**
     * Private methods
     */
    #neuralProcess() {
        // AI Process
        const offsets = this.sensor.readings.map(sensor => sensor == null ? 0 : 1 - sensor.offset);
        //Inputs
        const outputs = NeuralNetwork.feedForward([
            ...offsets,
            // Number(this.foodFound),
            // Number(this.anthillFound),
            // Number(this.energy / 100)
        ], this.brain);
        // Outputs
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
        // this.controls.pick = outputs[4];
        // this.controls.drop = outputs[5];
        // this.controls.run = outputs[5];
        // this.controls.eat = outputs[6];

        // Player Process
        const controls = this.player ? this.app.controls.getControls(this) : this.controls;
        this.#move(controls);
        this.#mark(controls);
        this.#smell();
        this.#carryFood(controls);
        this.#eatFood(controls);
        this.#metabolism(controls);
        this.#dropFood(controls);
        this.#age();
    }

    #smell() {
        this.sensor.update([
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
        if (this.app.request - (this.requestFlags.age ?? 0) < 1000) return;
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

    drawAntNetwork() {
        if (this.app.game.constructor.name !== 'Ants2Trainer' || this !== this.app.player.ant) {
            return;
        }

        const boxDistance = 80;
        const nWidth= 100;
        const nHeight= 100;
        const contexter = this.app.gui.ctx;
        const nX= (this.app.player?.ant?.x) + boxDistance;
        const nY= (this.app.player?.ant?.y) - nHeight - boxDistance;

        contexter.lineWidth = 1.5;
        this.app.player?.ant?.brain && this.app.gui.get.square({
            ctx: contexter,
            x: nX,
            y: nY,
            width: nWidth,
            height: nHeight,
            color: 'rgba(158,144,183,0.49)',
            stroke: 'rgb(0,150,234)'
        });
        contexter.beginPath();
        contexter.moveTo(nX, nY + nHeight);
        contexter.lineTo(nX - boxDistance, nY + boxDistance + nHeight);
        contexter.stroke();
        contexter.lineWidth = 0.5;
        this.app.player?.ant?.brain && Visualizer.drawNetwork(
            contexter,
            this.app.player.ant.brain,
            nX + 10,
            nY + 10,
            nWidth - 20,
            nHeight - 20,
            6.5
        );
    }

    drawAnt(ctx) {
        this.app.gui.get.drawPolygon(ctx, this);
        !this.no_draw && this.sensor.draw(ctx);
        this.drawAntNetwork();
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
        }
    }
}

