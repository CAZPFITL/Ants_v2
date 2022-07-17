export default class Factory {
    constructor(app) {
        this.app = app;
        this.binnacle = {};
        this.verbose = false;
    }

    create(object, props) {
        // Create an object collection if it doesn't exist
        (!this.binnacle[object.name]) && (this.binnacle[object.name] = []);
        // Instantiate the object
        const id = this.binnacle[object.name].length;

        const instanceFromType = new object({id, ...props})

        // Object registration in binnacle
        this.binnacle[object.name].push(instanceFromType);
        this.app.entities.push(instanceFromType);
        this.verbose && console.log(
            `%c${instanceFromType.prefix ?? ''}%c${instanceFromType.name} - Created.`,
            'font-weight: bold; color: #AA9922;',
            'font-weight: light;'
        );

        return instanceFromType;
    }

    addGameEntity(entity) {
        if (!(this.binnacle.GameObjects instanceof Array)) {
            this.binnacle.GameObjects = [];
        }
        this.binnacle.GameObjects.push(entity);
    }
}
