export default class Controls {
    constructor(app) {
        this.app = app;
        this.entity = app.anthill.population[0];
        this.forward = false;
        this.reverse = false;
        this.right = false;
        this.left = false;
        this.#addKeyboardListeners();
    }

    // update controls entity
    updateEntity(entity) {
        this.entity = entity;
    }

    // Private method to add keyboard listeners
    #addKeyboardListeners() {
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
    }
}
