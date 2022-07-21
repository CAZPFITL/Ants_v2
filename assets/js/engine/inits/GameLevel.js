export default class GameLevel {
    constructor({app, id = 0, width, height}) {
        this.app = app;
        this.name = 'GameLevel #' + id;
        this.entities = [];
        this.coords = { x: -width / 2, y: -height / 2 };
        this.size = { width, height}
        this.color = '#523f32';
        this.app.factory.addGameEntity(this);
    }

    /**
     * In game draw section
     */
    update() {}

    draw() {
        // TODO change this to draw the level
        this.app.gui.ctx.fillStyle = this.color;
        this.app.gui.ctx.fillRect(this.coords.x, this.coords.y, this.size.width, this.size.height);
    }
}