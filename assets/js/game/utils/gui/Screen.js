import State from './engine/utils/env/State.js';

const LOAD = 'load';
const MENU = 'menu';
const PLAY = 'play';
const PAUSE = 'pause';
const WIN = 'win';
const GAME_OVER = 'game_over';

export default class Screen {
    constructor(app) {
        this.app = app;
        this.state = new State(app, 'load');
        this.states = {
            LOAD,
            MENU,
            PLAY,
            PAUSE,
            WIN,
            GAME_OVER
        }
    }
}