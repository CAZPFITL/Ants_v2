export default class Player {
    constructor(app) {
        this.app = app;
        this.app.inits.push(this.init.bind(this));
    }

    init() {
        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0
        }
        console.log('Player init');
    }


    addListeners() {
        const changeControlledEntity = (event) => {
            const coords = this.app.tools.getClickCoords(event);
            const entity = this.app.tools.getEntityAt(coords);
            entity && this.app.controls.updateEntity(entity);
        }

        const movePlayerKD = (event) => {
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
        }

        const movePlayerKU = (event) => {
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
            }
        }

        return {
            onclick: [
                changeControlledEntity,
            ],
            onkeydown: [
                movePlayerKD,
            ],
            onkeyup: [
                movePlayerKU,
            ],
        }
    }

}