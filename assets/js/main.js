import {createCanvas} from './utils/utils.js';
import {App} from './components/App.js';

let app = new App(createCanvas());

const animate = (time) => {
    // ctx save and canvas update to reload it on every frame
    app.canvas.height = window.innerHeight;
    app.ctx.save();

    // draw

    // restore and request
    app.ctx.restore();
    window.request = requestAnimationFrame(animate);
}

window.request = requestAnimationFrame(animate);
