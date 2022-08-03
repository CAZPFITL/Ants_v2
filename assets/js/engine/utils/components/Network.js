export default class NeuralNetwork {
    constructor(app, neuronCount) {
        this.app = app;
        this.getNetworkData({neuronCount});
    }
    /**
     * Class methods
     */
    // Crossover script for the network
    getNetworkData({neuronCount}) {
        this.levels = [];
        for (let i = 0; i < neuronCount.length - 1; i++) {
            this.levels.push(new Level(
                neuronCount[i],
                neuronCount[i + 1]
            ));
        }
    }
    /**
     * Static methods
     */
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
        for (let i = 0; i < network.levels.length; i++) {
            for (let j = 0; j < network.levels[i].biases.length; j++) {
                network.levels[i].biases[j] = MathMe.lerp(
                    network.levels[i].biases[j],
                    MathMe.random(),
                    amount
                );
            }
            for (let j = 0; j < network.levels[i].weights.length; j++) {
                for (let k = 0; k < network.levels[i].weights[j].length; k++) {
                    network.levels[i].weights[j][k] = MathMe.lerp(
                        network.levels[i].weights[j][k],
                        MathMe.r(),
                        amount
                    );
                }
            }
        }
    }

    static evolveFromParents(network1, network2) {
        for (let i = 0; i < network1.levels.length; i++) {
            for (let j = 0; j < network1.levels[i].biases.length; j++) {
                network1.levels[i].biases[j] = MathMe.lerp(
                    network1.levels[i].biases[j],
                    network2.levels[i].biases[j],
                    0.5
                );
            }
            for (let j = 0; j < network1.levels[i].weights.length; j++) {
                for (let k = 0; k < network1.levels[i].weights[j].length; k++) {
                    network1.levels[i].weights[j][k] = MathMe.lerp(
                        network1.levels[i].weights[j][k],
                        network2.levels[i].weights[j][k],
                        0.5
                    );
                }
            }
        }
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
                level.weights[i][j] = MathMe.random();
            }
        }
        // loop through all the biases and set them to random numbers between -1 and 1
        for (let i = 0; i < level.biases.length; i++) {
            level.biases[i] = MathMe.random();
        }
    }

    // feed forward propagation of the level
    static feedForward(givenInputs, level) {
        // set the given inputs to the level's inputs
        for (let i = 0; i < level.inputs.length; i++) {
            level.inputs[i] = givenInputs[i];
        }

        // // loop through all the outputs
        // for (let i = 0; i < level.outputs.length; i++) {
        //     let sum = 0;
        //     //loop through all the inputs
        //     for (let j = 0; j < level.inputs.length; j++) {
        //         sum += level.inputs[j] * level.weights[j][i];
        //     }
        //     // compares
        //     if(sum > level.biases[i]){
        //         level.outputs[i] = 1;
        //     } else {
        //         level.outputs[i] = 0;
        //     }
        // }

        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            //loop through all the inputs
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }
            // get output
            level.outputs[i] = MathMe.relu(sum + level.biases[i]);
        }

        return level.outputs
    }
}

class MathMe {
    static random(){
        return Math.random() * 2 - 1
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static relu(x) {
        return x > 0 ? x : 0;
    }
}