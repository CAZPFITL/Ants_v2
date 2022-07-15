export default class Level {
    constructor(props) {
        this.name = 'Level';
        this.app = props.app;
        this.entities = [];
        this.targets = [];
        this.anthills = [];
        this.food = [];
        this.foodCount = 0;
        this.foodLimit = 100;
        this.foodRate = 0.1;
    }
}