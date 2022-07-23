export default class Screen {
    constructor(app, gui) {
        this.app = app;
        this.gui = gui;
    }

    drawPlayScreen() {

    }

    drawMainMenuScreen() {

    }

    drawGameOverScreen() {

    }

    update() {

    }

    draw() {
        (this.app.game.state.state === 'PLAY') && this.gui.drawControls();
        (this.app.game.state.state === 'PLAY') && this.gui.drawGameData();
    }
}