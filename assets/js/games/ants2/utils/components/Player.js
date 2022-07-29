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
            drop: 0,
            eat: 0,
            run: 0,
            mark: 0
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
            entity && this.followCamera && this.app.camera.follow(entity);
            entity && this.app.player.updateAnt(entity);
        });
        // Move Player Down events
        this.app.controls.pushListener('keydown', (event) => {
            switch (true) {
                case event.key === 'ArrowUp':
                    this.controls.forward = 1;
                    break;
                case event.key === 'ArrowDown':
                    this.controls.reverse = 1;
                    break;
                case event.key === 'ArrowRight':
                    this.controls.right = 1;
                    break;
                case event.key === 'ArrowLeft':
                    this.controls.left = 1;
                    break;
                case event.key === 'Shift':
                    this.controls.run = 1;
                    break;
                case event.key === 'w':
                    this.controls.mark = 1;
                    break;
                case event.key === 'q':
                    this.controls.drop = 1;
                    break;
                case event.key === 'e':
                    this.controls.eat = 1;
                    break;
                case event.key === ' ':
                    this.controls.pick = 1;
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
            switch (true) {
                case event.key === 'ArrowUp':
                    this.controls.forward = 0;
                    break;
                case event.key === 'ArrowDown':
                    this.controls.reverse = 0;
                    break;
                case event.key === 'ArrowRight':
                    this.controls.right = 0;
                    break;
                case event.key === 'ArrowLeft':
                    this.controls.left = 0;
                    break;
                case event.key === 'Shift':
                    this.controls.run = 0;
                    break;
                case event.key === 'w':
                    this.controls.mark = 0;
                    break;
                case event.key === 'q':
                    this.controls.drop = 0;
                    break;
                case event.key === 'e':
                    this.controls.eat = 0;
                    break;
                case event.key === ' ':
                    this.controls.pick = 0;
                    break;
                case event.key === 'f':
                    this.followCamera = !this.followCamera;
                    break;
                case event.key === 'c':
                    this.nextAnt();
                    break;
                case event.key === '+':
                    // TODO move this to the anthill
                    this.app.player.anthill.addAnt();
                    break;
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
        this.app.camera.follow(this.ant)
    }

    nextAnt() {
        const ants = this.app.factory.binnacle.Ant;
        const antKey = ants.findIndex(ant => ant.id === this.ant.id);
        this.updateAnt(ants[antKey + 1] || ants[0]);
    }
}