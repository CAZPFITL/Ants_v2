export default class Controls {
    constructor(app) {
        this.app = app;
        this.app.inits.push(this.init.bind(this));
    }

    init() {
        this.addListeners();
    }

    readMovement(entity) {
        const controls = this.app.controls.getControls(entity);

        (controls.forward) && (entity.speed += entity.acceleration);
        (controls.reverse) && (entity.speed -= entity.acceleration);

        (controls.left) && (entity.angle += entity.turnSpeed);
        (controls.right) && (entity.angle -= entity.turnSpeed);
    }

    getControls(entity) {
        return this.app.player.entity === entity
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
