export default class Sensor {
    constructor(entity) {
        this.entity = entity;
        this.app = entity.app;
        this.no_update = false;
        this.no_draw = this.app.game.constructor.name === 'Ants2';
        this.rayCount = 5;
        this.rayLength = 50;
        this.raySpread = Math.PI * 0.5;
        this.rays = [];
        this.readings = [];
    }

    castRays() {
        this.rays = [];
        // loop to get all the rayCount iterations of the rays
        for (let i = 0; i < this.rayCount; i++) {
            // get the angle of the ray
            const rayAngle = this.app.tools.lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.entity.angle;
            // get start drawing point
            const start = {x: this.entity.x, y: this.entity.y};
            // get end drawing points
            const end = {
                x: this.entity.x - Math.sin(rayAngle) * this.rayLength,
                y: this.entity.y - Math.cos(rayAngle) * this.rayLength
            }
            // push the ray to this.rays
            this.rays.push([start, end]);
        }
    }

    getReading(ray, targets) {
        let touches = [];
        for (let i = 0; i < targets.length; i++) {
            const poly = targets[i].polygons;
            if (!poly || this.entity === targets[i]) {
                continue;
            }
            for (let j = 0; j < poly.length; j++) {
                const value = this.app.tools.getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                );
                if (value) {
                    touches.push(value);
                }
            }
        }
        if (touches.length === 0) {
            return null;
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(touch => touch.offset === minOffset);
        }
    }

    getReadings(targets) {
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(this.getReading(this.rays[i], targets));
        }
    }

    /**
     * Draw and Update methods
     */
    drawRay(ctx, ray, i, color, n) {
        let end = this.readings[i] ?? ray[1];

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.moveTo(
            ray[n].x,
            ray[n].y
        );
        ctx.lineTo(
            end.x,
            end.y
        );
        ctx.stroke();
    }

    drawRays(ctx) {
        for (let i = 0; i < this.rays.length; i++) {
            this.drawRay(ctx, this.rays[i], i, 'rgba(0,0,0,0.44)', 0);
            this.drawRay(ctx, this.rays[i], i, 'rgba(0,138,168,0.89)', 1);
        }
    }

    update(targets) {
        if (!this.no_update) {
            this.castRays();
            this.getReadings(targets);
        }
    }

    draw(ctx) {
        if (!this.no_draw) {
            this.drawRays(ctx);
        }
    }
}