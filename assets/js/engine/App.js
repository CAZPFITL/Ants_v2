import AppMethods from './utils/helpers/AppMethods.js';

export default class App extends AppMethods {
    constructor(onWindow, game) {
        super(game);
        onWindow && (window.app = this);
    }
}