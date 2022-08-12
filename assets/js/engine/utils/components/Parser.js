import NeuralNetwork from "../../../games/ants2/utils/components/Network.js";

export default class Parser {
    constructor(app) {
        this.app = app;
    }

    static save(collection) {
        const saveData = collection.map((ant) => ant.brain);
        const cache = [saveData[0]];

        if (saveData.length > 1) {
            saveData.shift();
            saveData.forEach((network, index) => {
                cache[0] = NeuralNetwork.evolveFromParents(cache[0], network, 0.01);
            });
        }

        console.log('saved', cache[0]);
        localStorage.setItem('_best', JSON.stringify(cache[0]));
    }

    static load() {
        return JSON.parse(localStorage.getItem('_best'));
    }
}