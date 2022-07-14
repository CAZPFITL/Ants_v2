export default class Ant {
    constructor(props) {
        this.#getModelData(props)
    }

    // calculate model data
    #getModelData({id, x = 0, y = 0, color = '#ff0000', app}) {
        this.name = 'Ant #' + id;
        this.app = app;
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 8;
        this.color = color;
        this.angle = 0;
        this.speed = 0;
        this.acceleration = 0.3;
        this.friction = 0.040;
        this.maxSpeed = 0.5;
        this.turnSpeed = 0.05;
        this.polygons = [];
    }

    // update ant
    update() {
        this.app.physics.walk(this);
        this.app.gui.createPolygon(this);
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

