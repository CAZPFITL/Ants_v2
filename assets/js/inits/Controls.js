export default class Controls {
    constructor(app) {
        this.app = app;
        this.entity = null;
        this.app.inits.push(this.init.bind(this));
    }

    init() {
        this.entity = this.app.anthill.population[this.app.anthill.population.length - 1];
        this.addListeners(() => {
            const camera = this.app.camera.addListeners();
            const player = this.app.player.addListeners();
            return {
                onclick: [
                    ...player.onclick
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
        });
    }

    updateEntity(entity) {
        this.entity !== entity && (this.entity = entity);
    }

    getControls(entity) {
        return this.entity === entity
            ? this.app.player.controls
            : entity.controls;
    }

    addListeners(listeners) {
        const { onclick, onwheel, onkeydown, onkeyup } = listeners();
        document.addEventListener('keydown', (e) => onkeydown.forEach(fn => fn(e)));
        document.addEventListener('keyup', (e) => onkeyup.forEach(fn => fn(e)));
        document.addEventListener('click', (e) => onclick.forEach(fn => fn(e)));
        document.addEventListener('wheel', (e) => onwheel.forEach(fn => fn(e)));
    }

    draw() {
        this.app.gui.drawControls();
    }
}
