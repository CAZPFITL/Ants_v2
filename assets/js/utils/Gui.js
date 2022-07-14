export default class Gui {
    constructor(app) {
        this.app = app;
    }

    // update new polygon coordinates
    createPolygon(entity) {
        entity.polygons = this.rectangle(entity).map(point =>
            ({x: point.x, y: point.y})
        );
    }

    // rectangle polygon array points calculation
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