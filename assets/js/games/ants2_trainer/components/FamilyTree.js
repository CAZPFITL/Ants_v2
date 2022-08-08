import Group from './FamilyGroup.js';

export default class FamilyTree {
    /**
     * Create the FamilyTree
     * @param app {object} - App to create the FamilyTree
     * @param elementsSize {number} - Size of the elements of the FamilyTree
     * @param marginLimit {number} - Limit of the margin of the FamilyTree
     */
    constructor({app, elementsSize = 100, marginLimit = 60}) {
        this.app = app;
        this.generations = [];
        this.elementsSize = elementsSize;
        this.marginLimit = marginLimit;
        this.margin = elementsSize / 2 > marginLimit ? marginLimit : elementsSize / 2;
        this.height = elementsSize * 3 + this.margin * 2;
        this.width = elementsSize * 3 + this.margin * 2;
        this.x = this.width / 2;
        this.y = this.height / 2;
        this.init();
    }

    /**
     * Initialize the FamilyTree
     */
    init() {
        this.setGeneration();
        this.setGroup(0, 1);
        this.app.factory.addGameEntity(this);
        this.app.log.registerEvent(
            `New FamilyTree Created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mFamilyTree\x1b[0m Created`
        );
    }

    /**
     * Draw the FamilyTree
     */
    setGeneration() {
        this.generations.push([]);
    }

    /**
     * Draw the FamilyTree
     * @param gen {number} - Generation to draw
     * @param id {number} - Id of the group to draw
     */
    setGroup(gen, id = this.getMembersTotal() + 1) {
        this.generations[gen].push(
            new Group({
                app: this.app,
                id,
                tree: this,
                fromBoard: false,
                haveChild: false,
                x: (this.x + this.generations[gen].length * (this.width + this.margin)) - this.width,
                y: this.y,
                gen
            })
        );
    }

    /**
     * Draw the FamilyTree
     * @param gen {number} - Generation to draw
     * @param group {number} - Group to draw
     * @param position {string} - Position of the group to draw
     * @param member {object} - Member to draw
     * @param id {number} - id of the member to draw
     */
    setMember(
        gen= this.generations.length,
        group= this.generations[this.generations.length - 1].length,
        position = 'father',
        member = this.app.player?.ant?.brain ?? {},
        id = this.getMembersTotal() + 1
    ) {
        this.generations[gen - 1][group - 1].addMember(position, member, id);
    }

    /**
     * Count the brains in the FamilyTree
     * @returns {number} - Total of members in the tree
     */
    getMembersTotal() {
        let total = 0;
        this.generations.forEach((generation) => {
            generation.forEach((group) => {
                total += group.totalMembers;
            });
        });
        return total;
    }

    /**
     * Update the FamilyTree
     * @param ctx {CanvasRenderingContext2D} - Context of the canvas
     */
    update(ctx = this.app.gui.ctx) {
        if (this.app.game.state.state === 'NETWORK') {
            // UPDATE BOARD MEASUREMENTS
            this.margin = this.elementsSize / 2 > this.marginLimit ? this.marginLimit : this.elementsSize / 2;
            this.height = this.elementsSize * 3 + this.margin * 2;
            this.width = this.elementsSize * 3 + this.margin * 2;
            this.x = this.width / 2;
            this.y = this.height / 2;

        }
    }
}
