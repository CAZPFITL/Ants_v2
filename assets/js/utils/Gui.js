export default class Gui {
    constructor(app) {
        this.app = app;
    }

    drawPolygon(ctx, entity) {
        ctx.beginPath();
        ctx.moveTo(entity.polygons[0].x, entity.polygons[0].y);

        for (let i = 1; i < entity.polygons.length; i++) {
            ctx.lineTo(entity.polygons[i].x, entity.polygons[i].y);
        }

        ctx.fillStyle = entity.color ?? '#000';
        ctx.fill();
    }

    createPolygon(entity) {
        const points = [];
        this.rectangle(entity).forEach(point => {
            points.push({
                x: point.x,
                y: point.y
            });
        });
        entity.polygons = points;
    }

    rectangle(entity) {
        const rad = Math.hypot(entity.width, entity.height) / 2;
        const alpha = Math.atan2(entity.width, entity.height);
        return [
            {
                x: entity.x - Math.sin(entity.angle - alpha) * rad,
                y: entity.y - Math.cos(entity.angle - alpha) * rad
            },
            {
                x: entity.x - Math.sin(entity.angle + alpha) * rad,
                y: entity.y - Math.cos(entity.angle + alpha) * rad
            },
            {
                x: entity.x - Math.sin(Math.PI + entity.angle - alpha) * rad,
                y: entity.y - Math.cos(Math.PI + entity.angle - alpha) * rad
            },
            {
                x: entity.x - Math.sin(Math.PI + entity.angle + alpha) * rad,
                y: entity.y - Math.cos(Math.PI + entity.angle + alpha) * rad
            }
        ]
    }
}