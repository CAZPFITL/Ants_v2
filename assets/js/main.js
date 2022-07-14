import {App} from './components/App.js';

window.app = new App();

const animate = (time) => {
    // begin camera
    app.camera.begin();

    // update the entities
    app.updateEntities();

    // draw
    app.drawEntities();

    // end camera: restore and request
    app.camera.end(app, animate);
}

app.request = requestAnimationFrame(animate);
