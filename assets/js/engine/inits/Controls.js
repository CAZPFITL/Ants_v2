export default class Controls {
    constructor(app) {
        this.app = app;
        this.entity = null;
        this.app.inits.push(this.init.bind(this));
    }

    init() {
        this.entity = this.app.anthill.population[this.app.anthill.population.length - 1];
        this.addListeners();
    }

    updateEntity(entity) {
        this.entity !== entity &&
            (this.entity = entity);
    }

    getControls(entity) {
        return this.entity === entity
            ? this.app.player.controls
            : entity.controls;
    }

    addListeners() {
        const camera = this.app.camera.addListeners();
        const player = this.app.player.addListeners();
        const gui = this.app.gui.addListeners();
        const listedListeners = {
            onclick: [
                ...player.onclick,
                ...gui.onclick
            ],
            onwheel: [
                ...camera.onwheel
            ],
            onkeydown: [
                ...player.onkeydown,
                ...camera.onkeydown,
            ],
            onkeyup: [
                ...player.onkeyup,
            ],
        }
        document.addEventListener('keydown', (e) => listedListeners.onkeydown.forEach(fn => fn(e)));
        document.addEventListener('keyup', (e) => listedListeners.onkeyup.forEach(fn => fn(e)));
        document.addEventListener('click', (e) => listedListeners.onclick.forEach(fn => fn(e)));
        document.addEventListener('wheel', (e) => listedListeners.onwheel.forEach(fn => fn(e)));
    }

    draw() {
        this.app.gui.drawControls();
    }
}
