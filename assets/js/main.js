import {createCanvas} from './utils/utils.js';
import {App} from './components/App.js';

window.app = new App(createCanvas());

const animate = (time) => {
    // update the entities
    app.updateEntities();

    // ctx save
    app.saveCtx();

    // draw
    app.drawEntities();

    // restore and request
    app.restore(animate);
}

app.request = requestAnimationFrame(animate);
