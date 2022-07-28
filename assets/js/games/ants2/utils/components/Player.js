export default class Player {
    constructor(app, game) {
        this.app = app;
        this.game = game;
        this.ant = null;
        this.anthill = null;
        this.followCamera = true;
        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0,
            pick: 0,
            eat: 0,
        }
        this.#addListeners();
    }
    /**
     * Private methods
     */
    #addListeners() {
        // Change Controlled Entity
        this.app.controls.pushListener('click', (event) => {
            const coords = this.app.gui.get.clickCoords(event, this.app.camera.viewport);
            const entity = this.app.gui.get.entityAt(coords, this.app.factory.binnacle.Ant);
            entity && this.app.camera.follow(entity);
            entity && this.app.player.updateAnt(entity);
        });
        // Move Player Down events
        this.app.controls.pushListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.controls.forward = 1;
                    break;
                case 'ArrowDown':
                    this.controls.reverse = 1;
                    break;
                case 'ArrowRight':
                    this.controls.right = 1;
                    break;
                case 'ArrowLeft':
                    this.controls.left = 1;
                    break;
            }
        });
        this.app.controls.pushListener('mousedown', (event) => {
            const {x, y} = {x: event.offsetX, y: event.offsetY};
            const controls = this.game.gui.screen.buttonsCollection.play.movementControls;

            Object.keys(controls).forEach(key => {
                this.app.gui.get.isClicked(
                    controls[key],
                    {x, y},
                    ()=> this.app.player.controls[key] = 1
                )
            });
        });
        // Move Player Up Events
        this.app.controls.pushListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.controls.forward = 0;
                    break;
                case 'ArrowDown':
                    this.controls.reverse = 0;
                    break;
                case 'ArrowRight':
                    this.controls.right = 0;
                    break;
                case 'ArrowLeft':
                    this.controls.left = 0;
                    break;
                case ' ':
                    this.controls.pick = Number(!this.controls.pick);
                    this.game.gui.screen.buttons.play.pick = Boolean(this.controls.pick);
                    break;
                case '+':
                    this.app.player.anthill.addAnt();
            }
        });
        this.app.controls.pushListener('mouseup', (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
            const controls = this.game.gui.screen.buttonsCollection.play.movementControls;

            Object.keys(controls).forEach(key => {
                this.app.gui.get.isClicked(
                    controls[key],
                    {x, y},
                    ()=> this.app.player.controls[key] = 0
                )
            });
        });
    }

    /**
     * Draw and Update methods
     */
    updateAnt(ant) {
        this.ant !== ant && (this.ant = ant);
    }
}