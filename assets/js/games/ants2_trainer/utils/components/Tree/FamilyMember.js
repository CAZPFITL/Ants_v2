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
    constructor({app, role, tree, group, id, fromBoard, haveChild, x, y}) {
        this.app = app;
        this.role = role;
        this.tree = tree;
        this.group = group;
        this.id = id;
        this.x = x;
        this.y = y;
        this.selected = false;
        this.width = this.tree.elementsSize;
        this.height = this.tree.elementsSize;
        this.brain = null;
        this.fromBoard = fromBoard;
        this.haveChild = haveChild;
        this.init();
    }

    /**
     * Initialize the Family Member
     */
    init() {
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
    draw(ctx = this.app.gui.ctx, x = this.x, y = this.y) {
        this.selected && console.log(this.selected)
        if (this.app.game.state.state === 'NETWORK') {
            const isSelected = this.tree.memberSelected === this;
            this.app.gui.get.square({
                ctx,
                x,
                y,
                width: this.group.tree.elementsSize,
                height: this.group.tree.elementsSize,
                color: isSelected ? '#FC9EFF56' : '#FFF',
                stroke: this.brain ? '#000' : '#777',
            });

            ctx.fillStyle = '#000';
            ctx.font = `${this.group.tree.elementsSize / 2}px Mouse`;
            const text = this.brain ? this.id : '';
            ctx.fillText(
                String(text),
                x + this.group.tree.elementsSize / 2 - (this.group.tree.elementsSize / 8),
                y + this.group.tree.elementsSize / 2 + (this.group.tree.elementsSize / 5)
            );
        }
    }
}