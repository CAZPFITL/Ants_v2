import AppMethods from './utils/AppMethods.js';

export default class App extends AppMethods {
    constructor(Game, onWindow = true, verbose = false) {
        super(Game, onWindow, verbose);
    }
}