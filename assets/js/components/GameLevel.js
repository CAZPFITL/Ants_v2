export default class GameLevel {
    constructor({app, id = 0, width, height}) {
        this.name = 'GameLevel #' + id;
        this.app = app;
        this.entities = [];
        this.coords = { x: -width / 2, y: -height / 2 };
        this.size = { width, height}
        this.color = '#523f32';
    }

    update() {
        this.entities.forEach(entity => entity.update());
    }

    draw() {
        // draw a rectangle with this.size measurements
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
        // // draw all entities
        // this.entities.forEach(entity => entity.draw(ctx));
    }
}