export default class Factory {
    constructor(app) {
        this.app = app;
        this.binnacle = {};
        this.verbose = false;
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
        // Object registration in app entities
        this.app.entities.push(instanceFromType);
        // verbose creation to debun on develop
        // TODO remove this
        this.verbose && console.log(
            `%c${instanceFromType.prefix ?? ''}%c${instanceFromType.name} - Created.`,
            'font-weight: bold; color: #AA9922;',
            'font-weight: light;'
        );
        // Return the object
        return instanceFromType;
    }

    // These objects are used to create instances of objects used in game like game in screen controls.
    addGameEntity(entity) {
        if (!(this.binnacle.GameObjects instanceof Array)) {
            this.binnacle.GameObjects = [];
        }
        this.binnacle.GameObjects.push(entity);
    }
}
