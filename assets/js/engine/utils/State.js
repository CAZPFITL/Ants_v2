export default class State {
    constructor(app, initialState = 'load') {
        this.state = initialState;
    }

    setState(state) {
        this.state = state;
    }
}