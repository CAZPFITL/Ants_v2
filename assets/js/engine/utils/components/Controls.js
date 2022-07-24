export default class Controls {
    constructor(app) {
        this.app = app;
        this.listeners = [];
    }

    getControls(entity) {
        return this.app.player.ant === entity
            ? this.app.player.controls
            : entity.controls;
    }

    pushListener(event, fn) {
        !this.listeners[event] ?
            (this.listeners[event] = [fn]) :
            (this.listeners[event].push(fn));

    }

    addListeners() {
        for ( let listener in this.listeners ) {
            document.addEventListener(listener, (e) =>
                this.listeners[listener].forEach(fn => fn(e))
            );
        }
    }
}
