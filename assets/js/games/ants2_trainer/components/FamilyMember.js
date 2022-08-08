export default class Member {
    /**
     * Create the Family Member
     * @param app {object} - App instance
     * @param tree {object} - Tree instance
     * @param group {object} - The group of the Family Member
     * @param id {number} - The id of the Family Member
     * @param fromBoard {boolean} - If the Family Member is created from the board
     * @param haveChild {boolean} - If the Family Member had a child
     * @param x {number} - The x position of the Family Member
     * @param y {number} - The y position of the Family Member
     */
    constructor({app, tree, group, id, fromBoard, haveChild, x, y}) {
        this.app = app;
        this.tree = tree;
        this.group = group;
        this.id = id;
        this.x = x;
        this.y = y;
        this.brain = null;
        this.fromBoard = fromBoard;
        this.haveChild = haveChild;
        this.init();
    }

    /**
     * Initialize the Family Member
     */
    init() {
        this.app.factory.addGameEntity(this);
        this.app.log.registerEvent(
            `New TreeGroup Created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mTreeGroup\x1b[0m Created`
        );
    }

    /**
     * Add a brain as a Family Member
     * @param brain {object} - The brain to add
     * @param id {number} - The id of the brain
     */
    addBrain(brain, id) {
        this.brain = brain;
        this.id = id;
    }

    /**
     * Draw the Family Member
     * @param ctx {CanvasRenderingContext2D} - The canvas context
     * @param x {number} - The x position of the Family Member
     * @param y {number} - The y position of the Family Member
     * @param color {string} - The color of the Family Member
     */
    draw(ctx, x, y, color) {
        if (this.app.game.state.state === 'NETWORK') {
            this.app.gui.get.square({
                ctx,
                x,
                y,
                width: this.group.tree.elementsSize,
                height: this.group.tree.elementsSize,
                color: '#FFF',
                stroke: color
            });

            ctx.fillStyle = '#000';
            ctx.font = `${this.group.tree.elementsSize / 2}px Mouse`;
            ctx.fillText(
                String(this.id ?? ''),
                x + this.group.tree.elementsSize / 2 - (this.group.tree.elementsSize / 8),
                y + this.group.tree.elementsSize / 2 + (this.group.tree.elementsSize / 5)
            );
        }
    }
}