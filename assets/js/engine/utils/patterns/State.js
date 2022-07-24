export default class State {
    constructor(caller, initialState, states) {
        this.caller = caller;
        this.states = [];
        this.state = '';
        this.addStates(states);
        this.setState(initialState);
    }

    addStates(states) {
        for (let i = 0; i < states.length; i++) {
            this.states.push(states[i]);
        }
    }

    setState(state) {
        // console.log('New', caller,'State:', state);
        this.state = state;
    }
}