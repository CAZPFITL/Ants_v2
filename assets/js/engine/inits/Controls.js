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
        const listeners = {
            'click': [
                ...player.onclick,
                ...gui.onmouseup,
            ],
            'mousedown': [
                ...gui.onmousedown,
            ],
            'mouseup': [
                ...gui.onmouseup,
            ],
            'touchstart': [
                ...gui.onmousedown,
            ],
            'touchend': [
                ...gui.onmouseup,
            ],
            'touchcancel': [
                ...gui.onmouseup,
            ],
            'wheel': [
                ...camera.onwheel
            ],
            'keydown': [
                ...player.onkeydown,
                ...camera.onkeydown,
            ],
            'keyup': [
                ...player.onkeyup,
            ],
        }
        for ( let listener in listeners ) {
            document.addEventListener(listener, (e) => listeners[listener].forEach(fn => fn(e)));
        }
    }
}
