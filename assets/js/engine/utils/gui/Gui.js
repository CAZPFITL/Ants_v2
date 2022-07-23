export default class Gui {
    constructor(app) {
        this.app = app;
        this.ctx = Gui.createCanvas('gameCanvas');
        this.controlsCtx = Gui.createCanvas('controlsCanvas');
        this.app.factory.addGameEntity(this);
    }

    /**
     * Private
     */

    static createCanvas(id) {
        const canvas = document.getElementById(id);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        return canvas.getContext('2d');
    }

    /**
     * Polygons - don't forget the fallbacks
     */
    createPolygon(entity) {
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

    drawPolygon(ctx = this.ctx, entity) {
        if (entity.polygons.length < 1) return;

        ctx.beginPath();
        ctx.moveTo(entity.polygons[0].x, entity.polygons[0].y);

        for (let i = 1; i < entity.polygons.length; i++) {
            ctx.lineTo(entity.polygons[i].x, entity.polygons[i].y);
        }

        ctx.fillStyle = entity.color ?? '#000';
        ctx.fill();
    }

    /**
     * Screen instantiable objects
     */
    button({ctx, font, x, y, width, height, text}) {
        // create a button to be used in the canvas
        this.square({ctx, x, y, width, height, color: '#ffa600', stroke: '#000'});
        this.text({ctx, font, color: '#000', text, x, y, width, height, center: true});
    }

    square({ctx, x, y, width, height, color = '#FFF', stroke = false}) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = color;
        ctx.fill();
        stroke && (ctx.strokeStyle = stroke);
        stroke && ctx.stroke();
    }

    text({ctx, font, color, text, x, y, width, height, center = false}) {
        ctx.font = font;
        ctx.fillStyle = color;
        const xText = x + width / 2 - ctx.measureText(text).width / 2;
        const yText = y + height / 2 + 5;
        ctx.fillText(text, center ? xText : x, center ? yText : y);
        return ctx.measureText(text).width;
    }

    bar({ctx, x, y, text, cap, fill, height = 10, fillColor, barColor = 'transparent', stroke}, negative = false) {
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