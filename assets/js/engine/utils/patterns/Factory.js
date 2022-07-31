export default class Factory {
    constructor(app) {
        this.app = app;
        this.binnacle = {};
    }

    create(object, props) {
        // Create an object collection if it doesn't exist
        (!this.binnacle[object.name]) && (this.binnacle[object.name] = []);
        // Create an id to be asigned to the object
        const id = this.binnacle[object.name].length;
        // Instantiate the object
        const instanceFromType = new object({id, ...props})
        // Object registration in factory binnacle
        this.binnacle[object.name].push(instanceFromType);
        // Return the object
        return instanceFromType;
    }

    remove(object) {
        const id = object.constructor.name;
        this.binnacle[id] = this.binnacle[id].filter(item => item !== object);
    }

    // These objects are used to create instances of objects used in games like games in screen controls.
    addGameEntity(entity) {
        if (!(this.binnacle.GameObjects instanceof Array)) {
            this.binnacle.GameObjects = [];
        }
        this.binnacle.GameObjects.push(entity);
    }
}
