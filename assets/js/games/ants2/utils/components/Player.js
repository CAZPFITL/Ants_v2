export default class Player {
    constructor(app, game) {
        this.app = app;
        this.game = game;
        this.ant = null;
        this.anthill = null;
        this.followCamera = this.game.constructor.name === 'Ants2';
        this.controls = this.app.game.constructor.name === 'Ants2'
            ? {
                forward: 0,
                reverse: 0,
                right: 0,
                left: 0,
                pick: 0,
                drop: 0,
                eat: 0,
                run: 0,
                mark: 0
            } : false;
        this.#addListeners();
    }

    /**
     * Private methods TODO MOVE THIS TO SCREEN
     */
    #addListeners() {
        // Change Controlled Entity
        this.app.controls.pushListener(this,'click', (event) => {
            const coords = this.app.gui.get.clickCoords(event, this.app.camera.viewport);
            const ant = this.app.gui.get.entityAt(coords, this.app.factory.binnacle.Ant);
            ant && this.followCamera && this.app.camera.follow(ant);
            ant && this.app.player.updateAnt(ant);
            const anthill = this.app.gui.get.entityAt(coords, this.app.factory.binnacle.Anthill);
            anthill && this.app.player.updateAnthill(anthill);
        });
        // Move Player Down events
        this.app.controls.pushListener(this,'keydown', (event) => {
            switch (true) {
                case event.key === 'ArrowUp' && this.app.game.constructor.name === 'Ants2':
                    this.controls.forward = 1;
                    break;
                case event.key === 'ArrowDown' && this.app.game.constructor.name === 'Ants2':
                    this.controls.reverse = 1;
                    break;
                case event.key === 'ArrowRight' && this.app.game.constructor.name === 'Ants2':
                    this.controls.right = 1;
                    break;
                case event.key === 'ArrowLeft' && this.app.game.constructor.name === 'Ants2':
                    this.controls.left = 1;
                    break;
                case event.key === 'Shift' && this.app.game.constructor.name === 'Ants2':
                    this.controls.run = 1;
                    break;
                case event.key === 'w' && this.app.game.constructor.name === 'Ants2':
                    this.controls.mark = 1;
                    break;
                case event.key === 'q' && this.app.game.constructor.name === 'Ants2':
                    this.controls.drop = 1;
                    break;
                case event.key === 'e' && this.app.game.constructor.name === 'Ants2':
                    this.controls.eat = 1;
                    break;
                case event.key === ' ' && this.app.game.constructor.name === 'Ants2':
                    this.controls.pick = 1;
                    break;
                case event.key === 'k':
                    this.app.log.registerEvent(
                        `Player Kill Ant #${this.ant.id}`,
                        `\x1b[31;1m| \x1b[0mPlayer Removed \x1b[31;1m${this.ant.constructor.name}${this.ant.id ? ` #${this.ant.id}` : ''}`
                    );
                    this.ant.home.removeAnt(this.ant);
                    break;
            }
        });
        // Move Player Up Events
        this.app.controls.pushListener(this,'keyup', (event) => {
            switch (true) {
                case event.key === 'ArrowUp' && this.app.game.constructor.name === 'Ants2':
                    this.controls.forward = 0;
                    break;
                case event.key === 'ArrowDown' && this.app.game.constructor.name === 'Ants2':
                    this.controls.reverse = 0;
                    break;
                case event.key === 'ArrowRight' && this.app.game.constructor.name === 'Ants2':
                    this.controls.right = 0;
                    break;
                case event.key === 'ArrowLeft' && this.app.game.constructor.name === 'Ants2':
                    this.controls.left = 0;
                    break;
                case event.key === 'Shift' && this.app.game.constructor.name === 'Ants2':
                    this.controls.run = 0;
                    break;
                case event.key === 'w' && this.app.game.constructor.name === 'Ants2':
                    this.controls.mark = 0;
                    break;
                case event.key === 'q' && this.app.game.constructor.name === 'Ants2':
                    this.controls.drop = 0;
                    break;
                case event.key === 'e' && this.app.game.constructor.name === 'Ants2':
                    this.controls.eat = 0;
                    break;
                case event.key === ' ' && this.app.game.constructor.name === 'Ants2':
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
        this.app.controls.pushListener(this,'mouseup', (e) => {
            const {x, y} = {x: e.offsetX, y: e.offsetY};
            const controls = {
                forward: this.game.gui.screen.buttonsCollection.PLAY.forward.props,
                reverse: this.game.gui.screen.buttonsCollection.PLAY.reverse.props,
                left: this.game.gui.screen.buttonsCollection.PLAY.left.props,
                right: this.game.gui.screen.buttonsCollection.PLAY.right.props
            }

            if (this.app.game.constructor.name === 'Ants2') {
                Object.keys(controls).forEach(key => {
                    this.app.gui.get.isClicked(
                        controls[key],
                        {x, y},
                        () => this.app.player.controls[key] = 0
                    )
                });
            }
        });
    }

    /**
     * Draw and Update methods
     */
    updateAnt(ant) {
        this.ant !== ant && (this.ant = ant);
    }

    updateAnthill(anthill) {
        this.anthill !== anthill && (this.anthill = anthill);
    }

    nextAnt() {
        const ants = this.app.factory.binnacle.Ant;
        const antKey = ants.findIndex(ant => ant.id === this.ant.id);
        this.updateAnt(ants[antKey + 1] || ants[0]);
    }
}