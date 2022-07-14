import {Controls} from "./Controls.js";

export class Ant {
    constructor(props) {
        this.controls = new Controls();
        this.#getModelData(props)
    }

    // calculate model data
    #getModelData({id, x = 0, y = 0, color}) {
        this.name = 'Ant #' + id;
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.color = color ?? '#ff0000';
        this.angle = 0;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.5;
        this.speed = 0;
    }

    // update new polygon coordinates
    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        this.polygons = points;
    }

    // update ant
    update() {
        this.#move();
        this.#createPolygon();
    }

    // ant movement
    #move() {
        // add acceleration to speed
        (this.controls.forward) && (this.speed += this.acceleration);
        (this.controls.reverse) && (this.speed -= this.acceleration);

        // add speed limiter
        (this.speed > this.maxSpeed) && (this.speed = this.maxSpeed);
        (this.speed < -this.maxSpeed / 2) && (this.speed = -this.maxSpeed / 2);

        // add friction and absolute repose in lower ranges
        (this.speed > 0) && (this.speed -= this.friction);
        (this.speed < 0) && (this.speed += this.friction);
        (this.speed < 0.1 && this.speed > -0.1) && (this.speed = 0);

        // add direction changing the value of angle
        (this.controls.left) && (this.angle += 0.03);
        (this.controls.right) && (this.angle -= 0.03);

        // // this works under the unit circle logic using sin or cos multiplied by speed to get the translation
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    // ant draw
    draw(ctx) {
        ctx.translate(this.x, this.y);

        ctx.beginPath();
        ctx.moveTo(this.polygons[0].x, this.polygons[0].y);

        for (let i = 1; i < this.polygons.length; i++) {
            ctx.lineTo(this.polygons[i].x, this.polygons[i].y);
        }

        ctx.fillStyle = this.color;
        ctx.fill();
    }
}