export default class Controls {
    constructor(app) {
        this.app = app;
        this.entity = null;
        this.forward = false;
        this.reverse = false;
        this.right = false;
        this.left = false;
        this.app.inits.push(this.init.bind(this));
    }

    init() {
        this.entity = this.app.anthill.population[this.app.anthill.population.length - 1];
        this.#addKeyboardListeners(() => {
            this.app.camera.addListeners();
        });
    }

    // update controls entity
    updateEntity(entity) {
        this.entity = entity;
    }

    changeControlledEntity(event) {
        const coords = this.app.tools.getClickCoords(event);
        const entity = this.app.tools.getEntityAt(coords);
        if (entity) {
            this.updateEntity(entity);
        }
    }

    // Private method to add keyboard listeners
    #addKeyboardListeners(externalEventListeners) {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    this.forward = true;
                    break;
                case 'ArrowDown':
                    this.reverse = true;
                    break;
                case 'ArrowRight':
                    this.right = true;
                    break;
                case 'ArrowLeft':
                    this.left = true;
                    break;
            }
        });
        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.forward = false;
                    break;
                case 'ArrowDown':
                    this.reverse = false;
                    break;
                case 'ArrowRight':
                    this.right = false;
                    break;
                case 'ArrowLeft':
                    this.left = false;
                    break;
            }
        });
        document.addEventListener('click', (e) => {
            this.changeControlledEntity(e);
        });
        externalEventListeners();
    }
}
