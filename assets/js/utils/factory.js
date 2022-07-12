export class Factory {
    constructor() {
        this.binnacle = [];
        this.verbose = true;
    }

    create(object, props) {
        // Create an object collection if it doesn't exist
        if (!this.binnacle[object]) {
            this.binnacle[object] = [];
        }
        // Instantiate the object
        const id = this.binnacle[object].length;
        const instanceFromType = new object({id, ...props})
        // Object registration in binnacle
        this.binnacle[object].push(instanceFromType);
        this.verbose && console.log(
            `%c${instanceFromType.prefix ?? ''}%c${instanceFromType.name} - Created.`,
            'font-weight: bold; color: #AA9922;',
            'font-weight: light;'
        );

        return instanceFromType;
    }
}
