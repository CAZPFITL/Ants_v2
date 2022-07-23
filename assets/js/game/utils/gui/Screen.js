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
        // MAIN MENU SCREEN ELEMENTS
        // TODO Add some main menu screen elements

        // PLAY GAME LEVEL CONTROLS SCREEN ELEMENTS
        if (this.app.game.state.state === 'PLAY' && this.app.game.level) {
            this.gui.drawGameLevelControls();
            this.gui.drawGameLevelData();
        }
    }
}