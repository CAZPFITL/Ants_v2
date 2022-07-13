export class Controls {
    constructor() {
        this.forward = false;
        this.reverse = false;
        this.right = false;
        this.left = false;
        this.#addKeyboardListeners();
        console.log('Controls initialized.');
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
