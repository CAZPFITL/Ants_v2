export default class Camera {
    constructor(app) {
        this.app = app;
        this.fieldOfView = Math.PI / 4.0;
        this.app.inits.push(this.init.bind(this));
    }

    init() {
        this.lookAt = [0, 0];
        this.viewport = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: 0,
            height: 0,
            scale: [1.0, 1.0]
        };
        this.maxZoom = 3000;
        this.minZoom = 50;
        this.zoom = this.maxZoom;
        this.#updateViewportData();
    }

    #scaleAndTranslate() {
        this.app.gui.ctx.scale(this.viewport.scale[0], this.viewport.scale[1]);
        this.app.gui.ctx.translate(-this.viewport.left, -this.viewport.top);
    }

    #zoomTo(z) {
        this.zoom = z;
        this.#updateViewportData();
    }

    #moveTo([x, y]) {
        this.lookAt = [x, y];
        this.#updateViewportData();
    }

    #updateViewportData() {
        this.aspectRatio = this.app.gui.ctx.canvas.width / this.app.gui.ctx.canvas.height;
        this.viewport.width = this.zoom * Math.tan(this.fieldOfView);
        this.viewport.height = this.viewport.width / this.aspectRatio;
        this.viewport.left = this.lookAt[0] - (this.viewport.width / 2.0);
        this.viewport.top = this.lookAt[1] - (this.viewport.height / 2.0);
        this.viewport.right = this.viewport.left + this.viewport.width;
        this.viewport.bottom = this.viewport.top + this.viewport.height;
        this.viewport.scale = [
            this.app.gui.ctx.canvas.width / this.viewport.width,
            this.app.gui.ctx.canvas.height / this.viewport.height
        ];
    }

    addListeners() {
        window.onwheel = e => {
            if (e.ctrlKey) {
                let zoomLevel = this.zoom + Math.floor(e.deltaY);
                this.#zoomTo(
                    (zoomLevel <= this.minZoom) ?
                        this.minZoom :
                        (zoomLevel >= this.maxZoom) ?
                            this.maxZoom :
                            zoomLevel
                );
            } else {
                this.#moveTo([
                    this.lookAt[0] + Math.floor(e.deltaX),
                    this.lookAt[1] + Math.floor(e.deltaY)
                ]);
            }
        };

        window.addEventListener('keydown', e => {
            if (e.key === 'r') {
                this.#zoomTo(this.maxZoom);
                this.#moveTo([0, 0]);
            }
        });
    }

    begin() {
        this.#updateViewportData()
        this.app.gui.ctx.canvas.height = window.innerHeight;
        this.app.gui.ctx.save();
        this.app.gui.controlsCtx.canvas.height = window.innerHeight;
        this.app.gui.controlsCtx.save();
        this.#scaleAndTranslate();
    }

    end(animate) {
        this.app.gui.ctx.restore();
        this.app.gui.controlsCtx.restore();
        this.app.request = requestAnimationFrame(animate);
    }
};