export default class Camera {
    constructor(app) {
        this.app = app;
        this.entity = app.anthill.population[0];
        this.fieldOfView = Math.PI / 4.0;
        this.#init();
    }

    #init() {
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
        this.maxZoom = 800;
        this.minZoom = 50;
        this.zoom = 800;
        this.#addListeners();
        this.#updateViewportData();
    }

    #scaleAndTranslate() {
        this.app.ctx.scale(this.viewport.scale[0], this.viewport.scale[1]);
        this.app.ctx.translate(-this.viewport.left, -this.viewport.top);
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
        this.aspectRatio = this.app.ctx.canvas.width / this.app.ctx.canvas.height;
        this.viewport.width = this.zoom * Math.tan(this.fieldOfView);
        this.viewport.height = this.viewport.width / this.aspectRatio;
        this.viewport.left = this.lookAt[0] - (this.viewport.width / 2.0);
        this.viewport.top = this.lookAt[1] - (this.viewport.height / 2.0);
        this.viewport.right = this.viewport.left + this.viewport.width;
        this.viewport.bottom = this.viewport.top + this.viewport.height;
        this.viewport.scale = [
            this.app.ctx.canvas.width / this.viewport.width,
            this.app.ctx.canvas.height / this.viewport.height
        ];
    }

    // Add Camera Controls
    // TODO - Add Controls Class to handle all controls from the game
    #addListeners() {
        // Zoom and scroll around world
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

        // Center camera on "R"
        window.addEventListener('keydown', e => {
            if (e.key === 'r') {
                this.#zoomTo(this.maxZoom);
                this.#moveTo([0, 0]);
            }
        });
    }

    // Update camera entity
    updateEntity(entity) {
        this.entity = entity;
    }

    // Begin camera cycle
    begin() {
        this.#updateViewportData()
        // Save the current state of the canvas and update the height to update the viewport
        this.app.ctx.canvas.height = window.innerHeight;
        this.app.ctx.save();
        // Apply the scale and translation
        this.#scaleAndTranslate();
    }

    // End camera cycle
    end(animate) {
        this.app.ctx.restore();
        this.app.request = requestAnimationFrame(animate);
    }
};