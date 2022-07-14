export class Camera {
    constructor(context, settings = {}) {
        console.log('Camera.constructor');
        this.context = context;
        this.fieldOfView = settings.fieldOfView || Math.PI / 4.0;
        this.#init();
    }

    #init() {
        this.distance = 1000.0;
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
        this.addListeners();
        this.updateViewport();
    }

    #applyScaleAndTranslation() {
        this.context.scale(this.viewport.scale[0], this.viewport.scale[1]);
        this.context.translate(-this.viewport.left, -this.viewport.top);
    }

    begin() {
        // Save the current state of the canvas and update the height to update the viewport
        this.context.canvas.height = window.innerHeight;
        this.context.save();
        // Apply the scale and translation
        this.#applyScaleAndTranslation();
    }

    end(app, animate) {
        this.context.restore();
        app.request = requestAnimationFrame(animate);
    }

    updateViewport() {
        this.aspectRatio = this.context.canvas.width / this.context.canvas.height;
        this.viewport.width = this.distance * Math.tan(this.fieldOfView);
        this.viewport.height = this.viewport.width / this.aspectRatio;
        this.viewport.left = this.lookAt[0] - (this.viewport.width / 2.0);
        this.viewport.top = this.lookAt[1] - (this.viewport.height / 2.0);
        this.viewport.right = this.viewport.left + this.viewport.width;
        this.viewport.bottom = this.viewport.top + this.viewport.height;
        this.viewport.scale[0] = this.context.canvas.width / this.viewport.width;
        this.viewport.scale[1] = this.context.canvas.height / this.viewport.height;
    }

    zoomTo(z) {
        this.distance = z;
        this.updateViewport();
    }

    moveTo([x, y]) {
        this.lookAt = [x, y];
        this.updateViewport();
    }

    addListeners() {
        // Zoom and scroll around world
        window.onwheel = e => {
            if (e.ctrlKey) {
                // Your zoom/scale factor
                let zoomLevel = this.distance - (e.deltaY * 10);
                if (zoomLevel <= 1) {
                    zoomLevel = 1;
                }

                this.zoomTo(zoomLevel);
            } else {
                // Your track-pad X and Y positions
                const x = this.lookAt[0] + (e.deltaX * 2);
                const y = this.lookAt[1] + (e.deltaY * 2);

                this.moveTo([x, y]);
            }
        };

        // Center camera on "R"
        window.addEventListener('keydown', e => {
            if (e.key === 'r') {
                this.zoomTo(1000);
                this.moveTo([0, 0]);
            }
        });
    }
};