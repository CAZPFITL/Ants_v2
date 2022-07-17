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
                    ...camera.onkeydown,
                    ...player.onkeydown,
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
        // console.log(this.entity.controls)
        return this.entity === entity
            ? this.app.player.controls
            : entity.controls;
    }

    readMovement(entity) {
        const controls = this.getControls(entity);

        (controls.forward) && (entity.speed += entity.acceleration);
        (controls.reverse) && (entity.speed -= entity.acceleration);

        (controls.left) && (entity.angle += entity.turnSpeed);
        (controls.right) && (entity.angle -= entity.turnSpeed);
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
