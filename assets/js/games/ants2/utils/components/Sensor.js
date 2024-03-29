import Tools from '../../../../engine/utils/helpers/Tools.js';

export default class Sensor {
    constructor(entity, rayCount = 5, rayLength = 50, raySpread = Math.PI * 0.5, color = 'rgba(0,0,0,0.9)') {
        this.entity = entity;
        this.tools = Tools;
        this.no_update = false;
        this.no_draw = false;
        this.rayCount = rayCount;
        this.rayLength = rayLength;
        this.raySpread = raySpread;
        this.rays = [];
        this.readings = [];
        this.color = color;
    }

    castRays() {
        this.rays = [];
        // loop to get all the rayCount iterations of the rays
        for (let i = 0; i < this.rayCount; i++) {
            // get the angle of the ray
            const rayAngle = this.tools.lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.entity.angle;
            // get start drawing point
            const start = {x: (this.entity?.x ?? this.entity?.coords?.x), y: (this.entity?.y?? this.entity?.coords?.y)};
            // get end drawing points
            const end = {
                x: (this.entity?.x ?? this.entity?.coords?.x) - Math.sin(rayAngle) * this.rayLength,
                y: (this.entity?.y?? this.entity?.coords?.y) - Math.cos(rayAngle) * this.rayLength
            }
            // push the ray to this.rays
            this.rays.push([start, end]);
        }
    }

    getReading(ray, targets) {
        let touches = [];
        let findings = [];
        for (let i = 0; i < targets.length; i++) {
            const poly = targets[i].polygons;
            if (!poly || this.entity === targets[i]) {
                continue;
            }
            for (let j = 0; j < poly.length; j++) {
                const value = this.tools.getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                );
                if (value) {
                    touches.push(value);
                    findings.push(targets[i]);
                }
            }
        }
        if (touches.length === 0) {
            return null;
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return [touches.find(touch => touch.offset === minOffset), findings];
        }
    }

    getReadings(targets) {
        this.readings = [];
        this.findings = [];
        for (let i = 0; i < this.rays.length; i++) {
            const readings = this.getReading(this.rays[i], targets) ?? [];
            this.readings.push(readings[0]);
            (readings[1]) && this.findings.push(...readings[1]);
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
            this.drawRay(ctx, this.rays[i], i, 'red', 1);
            this.drawRay(ctx, this.rays[i], i, this.color, 0);
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