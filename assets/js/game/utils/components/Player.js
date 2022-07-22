export default class Player {
    constructor(app) {
        this.app = app;
        this.entity = null;
        this.controls = {
            forward: 0,
            reverse: 0,
            right: 0,
            left: 0,
            pick: 0,
        }
    }

    /**
     * Callback
     */
    updateEntity(entity) {
        this.entity !== entity &&
        (this.entity = entity);
    }

    /**
     * Listeners TODO: move to separate class (Controls from the game)
     */
    addListeners() {
        const changeControlledEntity = (event) => {
            const coords = this.app.tools.getClickCoords(event);
            const entity = this.app.tools.getEntityAt(coords, this.app.factory.binnacle.Ant);
            entity && this.app.player.updateEntity(entity);
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
                case ' ':
                    this.controls.pick = 1;
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
                case ' ':
                    this.controls.pick = 0;
                    break;
                case '+':
                    console.log(event.key);
                    this.app.anthill.addAnt();
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