export default class Player {
    constructor(app, game) {
        this.app = app;
        this.game = game;
        this.ant = null;
        this.anthill = null;
        this.followCamera = true;
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
        // Move Player Up Events
        this.app.controls.pushListener('keyup', (event) => {
            switch (true) {
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