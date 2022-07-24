import App from './engine/App.js';
import Ants from './games/ants2/Game.js';
import TicTacToe from './games/tic_tac_toe/Game.js';

// Loading this a green screen should be displayed and no errors are thrown
class Test {}

new App(true, Ants);
