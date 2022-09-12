import AppMethods from './utils/AppMethods.js';

export default class App extends AppMethods {
    constructor(onWindow, game) {
        super(game, true);
        onWindow && (window.app = this);
    }
}