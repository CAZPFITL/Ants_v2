import Camera from "./Camera.js";
import Tools from "./../helpers/Tools.js";

export default class Gui {
    constructor(app) {
        this.app = app;
        this.get = Gui;
        this.ctx = Gui.createCanvas('gameCanvas');
        this.app.factory.addGameEntity(this);
    }

    /**
     * Static
     */
    static createCanvas(id) {
        const canvas = document.getElementById(id);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return canvas.getContext('2d');
    }

    static isClicked(entity, click, callback) {
        const {x, y, width, height} = entity;
        if (click.x > x && click.x < x + width && click.y > y && click.y < y + height) {
            callback();
        }
    }

    static clickCoords = (e, viewport) => ({
        x: e.clientX / viewport.scale[0] + viewport.left,
        y: e.clientY / viewport.scale[1] + viewport.top
    })

    static entityAt(click, collection) {
        for (let i = 0; i < collection.length; i++) {
            const entity = collection[i];

            if (entity.polygons instanceof Array) {
                const polysIntersect = Gui.isPointInsidePolygon(click, entity.polygons);
                if (polysIntersect)
                    return entity;
            }
        }
    }

    static isPointInsidePolygon = (point, polygon) => {
        let isInside = false;
        let i = 0;
        let j = polygon.length - 1;

        for (; i < polygon.length; j = i++) {
            const x = {
                dividend: (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y),
                divisor: (polygon[j].y - polygon[i].y)
            }
            const condition1 = (polygon[i].y > point.y) !== (polygon[j].y > point.y);
            const condition2 = (point.x < x.dividend / x.divisor + polygon[i].x);

            if (condition1 && condition2) {
                isInside = !isInside;
            }
        }
        return isInside;
    }

    static createPolygon(entity) {
        const shape = entity.shape();
        if (shape.length < 1) return;
        const points = [];
        shape.forEach(point => {
            points.push({
                x: point.x,
                y: point.y
            });
        });
        entity.polygons = points;
    }

    static drawPolygon(ctx, entity) {
        if (entity.polygons.length < 1) return;

        ctx.beginPath();
        ctx.moveTo(entity.polygons[0].x, entity.polygons[0].y);

        for (let i = 1; i < entity.polygons.length; i++) {
            ctx.lineTo(entity.polygons[i].x, entity.polygons[i].y);
        }

        ctx.fillStyle = entity.color ?? '#000';
        ctx.fill();
    }

    static polysIntersect(poly1, poly2) {
        for (let i = 0; i < poly1.length; i++) {
            for (let j = 0; j < poly2.length; j++) {
                const touch = Tools.getIntersection(
                    poly1[i],
                    poly1[(i + 1) % poly1.length],
                    poly2[j],
                    poly2[(j + 1) % poly2.length],
                )
                if (touch) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Screen instantiable objects
     */
    static button({ctx, font, x, y, width, height, text, bg = '#ffa600', color = '#000', stroke = '#000'}) {
        // create a button to be used in the canvas
        this.square({ctx, x, y, width, height, color: bg, stroke});
        this.text({ctx, font, color, text, x, y, width, height, center: true});
    }

    static square({ctx, x, y, width, height, color = '#FFF', stroke = false}) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = color;
        ctx.fill();
        stroke && (ctx.strokeStyle = stroke);
        stroke && ctx.stroke();
    }

    static text({ctx, font, color, text, x, y, width, height, center = false}) {
        ctx.font = font;
        ctx.fillStyle = color;
        const xText = x + width / 2 - ctx.measureText(text).width / 2;
        const yText = y + height / 2 + 5;
        ctx.fillText(text, center ? xText : x, center ? yText : y);
        return ctx.measureText(text).width;
    }

    static bar({ctx, x, y, text, cap, fill, height = 10, fillColor, barColor = 'transparent', stroke}, negative = false) {
        const normalizedProgress = fill / (cap / 255);
        const progress = negative ? (cap - fill) : fill

        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, cap, height);
        stroke && (ctx.strokeStyle = stroke);
        stroke && (ctx.strokeRect(x, y, cap, height));

        ctx.fillStyle = fillColor === 'green-red' ?
            `rgb(${normalizedProgress}, ${255 - normalizedProgress}, 0)` :
            'red-green' ? `rgb(${255 - normalizedProgress}, ${normalizedProgress}, 0)` : fillColor;
        ctx.fillRect(x, y, progress, height);


        text && (this.text({ctx, font: '12px Mouse', color: '#000', text, x, y: y - height}));
    }
}