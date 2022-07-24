export default class NeuralNetwork {
    constructor(app, neuronCount) {
        this.app = app;
        this.getNetworkData({neuronCount});
    }

    getNetworkData({neuronCount}) {
        this.levels = [];
        for (let i = 0; i < neuronCount.length - 1; i++) {
            this.levels.push(new Level(
                neuronCount[i],
                neuronCount[i + 1]
            ));
        }
    }

    // feed forward propagation of the network
    static feedForward(givenInputs, network) {
        // get the level outputs
        let outputs = Level.feedForward(
            givenInputs,
            network.levels[0]
        );
        for (let i = 1; i < network.levels.length; i++) {
            // Put the level outputs in the new inputs
            outputs = Level.feedForward(
                outputs,
                network.levels[i]
            );
        }
        // return the last level outputs
        return outputs;
    }

    // Mutation script for the network
    static mutate(network, amount=1) {
        const lerp = (a, b, t) => a + (b - a) * t;

        network.levels.forEach(level => {
            for (let i = 0; i < level.biases.length; i++) {
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                );
            }
            for (let i = 0; i < level.weights.length; i++) {
                for (let j = 0; j < level.weights[i].length; j++) {
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    );
                }
            }
        })
    }
}

// this class works as a layer of the neural network
class Level {
    // constructor takes the number of inputs and outputs
    constructor(inputCount, outputCount) {
        // create the arrays
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);
        this.biases = new Array(outputCount);
        // generate weights
        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            this.weights[i] = new Array(outputCount);
        }
        // generate biases and randomize them
        Level.#randomize(this);
    }

    // Get a random data for starting the network
    static #randomize(level) {
        // loop through all the inputs and outputs and set the weights to a random value between -1 and 1
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random() * 2 - 1;
            }
        }
        // loop through all the biases and set them to random numbers between -1 and 1
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = Math.random() * 2 - 1;
        }
    }

    // feed forward propagation of the level
    static feedForward(givenInputs, level) {
        // set the given inputs to the level's inputs
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }
        // loop through all the outputs
        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            //loop through all the inputs
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }
            // compares
            if(sum > level.biases[i]){
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs
    }
}