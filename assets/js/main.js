import App from './engine/App.js';
import Ants2 from './games/ants2/Game.js';
import Ants2Trainer from './games/ants2_trainer/Game.js';

// Loading this a green screen should be displayed and no errors are thrown
class Test {}

new App(true, Ants2Trainer);
