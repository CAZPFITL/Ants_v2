import NeuralNetwork from "./Network.js";

/**
 * tasks = [
 *      {
 *          neuronCount: [
 *              inputs: number,
 *              layer: number,
 *              nLayer: number,
 *              outputs: number
 *          ],
 *          inputs: sensor | digital | analog,
 *          outputs: Array<any>',
 *      }
 * ]
 */
export default class Brain {
    constructor(tasks, controls) {
        this.tasks = tasks;
        this.brain = [];
        this.controls = controls;
        this.outputs = controls;
        this.mainNeuralNetwork = [];
        this.#init(controls);
    }

    #init(controls) {
        // prepare tasks
        for (let i = 0; i < this.tasks.length; i++) {
            this.brain.push(
                new NeuralNetwork([
                    ...this.tasks[i].neuronCount
                ])
            );
        }
        // prepare main neural network to take decisions
        this.mainNeuralNetwork = new NeuralNetwork([
            Object.keys(this.controls).length,
            4,
            6,
            Object.keys(this.outputs).length,
        ]);
        this.restartOutputs();
    }

    restartOutputs() {
        // loop tru all outputs and set their values to []
        for (let i = 0; i < Object.keys(this.outputs).length; i++) {
            this.outputs[Object.keys(this.outputs)[i]] = [];
        }
    }

    update() {
        this.restartOutputs();
        const senses = [...this.tasks]
        // get outputs from all tasks
        for (let i = 0; i < senses.length; i++) {
            // extract analog input
            const offsets = senses[i].inputs.readings.map(sensor =>
                sensor == null
                    ? 0
                    : 1 - sensor.offset
            );
            // get outputs from analog inputs
            const outputs = NeuralNetwork.feedForward(offsets, this.brain[i]);

            // add to outputs element the output to the final process
            for (let j = 0; j < senses[i].outputs.length; j++) {
                this.outputs[senses[i].outputs[j]].push(outputs[j]); // this
            }
        }
        // average outputs collections from different processes
        for (let i = 0; i < Object.keys(this.outputs).length; i++) {
            const element = this.outputs[Object.keys(this.outputs)[i]];
            if (element instanceof Array) {
                const value = (element.reduce((a, b) => a + b, 0)) / element.length;
                this.outputs[Object.keys(this.outputs)[i]] = typeof value === 'number' && !isNaN(value) ? value : 0;
            }
        }

        // loop through all the outputs and equals in controls namesake
        for (let i = 0; i < Object.keys(this.outputs).length; i++) {
            this.controls[Object.keys(this.outputs)[i]] = this.outputs[Object.keys(this.outputs)[i]];
        }
    }
}