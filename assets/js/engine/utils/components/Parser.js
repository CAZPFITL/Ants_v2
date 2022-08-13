import NeuralNetwork from "../../../games/ants2/utils/components/Network.js";
import Brain from "../../../games/ants2/utils/components/Brain.js";

export default class Parser {
    constructor(app) {
        this.app = app;
    }

    static save(collection) {
        const saveData = collection.map((ant) => ant.brain.brain);
        const cache = saveData[0];

        if (saveData.length > 1) {
            saveData.shift();
            saveData.forEach((brain, index) => {
                Brain.pairBrains(cache, brain, 0.01);
            });
        }
        console.log('saved', cache);
        localStorage.setItem('bestBrain', JSON.stringify(cache));
    }

    static load() {
        console.log(JSON.parse(localStorage.getItem('bestBrain')));
        return JSON.parse(localStorage.getItem('bestBrain'));
    }
}