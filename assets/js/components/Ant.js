export class Ant {
    constructor(props) {
        this.#getModelData(props)
    }

    #getModelData({id, x, y, color}) {
        this.name = 'Ant #' + id;
        this.x = x ?? window.innerHeight / 2;
        this.y = y ?? window.innerWidth / 2;
        this.color = color ?? '#000';
    }

}