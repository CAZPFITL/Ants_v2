export default class State {
    constructor(app, initialState, states, caller) {
        this.app = app;
        this.states = [];
        this.state = '';
        this.addStates(states);
        this.setState(initialState, caller);
    }

    addStates(states) {
        for (let i = 0; i < states.length; i++) {
            this.states.push(states[i]);
        }
    }

    setState(state, caller) {
        // console.log('New', caller,'State:', state);
        this.state = state;
    }
}