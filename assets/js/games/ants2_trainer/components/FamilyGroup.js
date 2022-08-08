import NeuralNetwork from "../../ants2/utils/components/Network.js";
import Member from "./FamilyMember.js";

export default class Group {
    /**
     * Create the Family Group
     * @param app {object} - App instance
     * @param tree {object} - Tree instance
     * @param id {number} - id of the Family Group
     * @param fromBoard {boolean} - if the Family Group is created from the board
     * @param haveChild {boolean} - if the Family Group have a child
     * @param x {number} - x position of the Family Group
     * @param y {number} - y position of the Family Group
     * @param gen {number} - generation of the Family Group
     */
    constructor({app, tree, id, fromBoard, haveChild, x, y, gen}) {
        this.app = app;
        this.tree = tree;
        this.id = id;
        this.father = null;
        this.mother = null;
        this.child = null;
        this.x = x;
        this.y = y;
        this.margin = this.tree.elementsSize / 2 > this.tree.marginLimit ? this.tree.marginLimit : this.tree.elementsSize / 2;
        this.width = this.tree.elementsSize * 3 + this.margin * 2;
        this.height = this.tree.elementsSize * 3 + this.margin * 2;
        this.gen = gen;
        this.totalMembers = 0;
        this.app.log.registerEvent(
            `New TreeGroup #${this.id} created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mTreeGroup #${this.id}\x1b[0m Created`
        );
        this.init();
    }

    /**
     * Initialize the Family Group
     */
    init() {
        this.father = this.app.factory.create(Member, {
            app: this.app,
            role: 'father',
            tree: this.tree,
            group: this,
            fromBoard: false,
            haveChild: false,
            x: this.x + this.margin,
            y: -this.y + this.margin,
        });
        this.mother = this.app.factory.create(Member, {
            app: this.app,
            role: 'mother',
            tree: this.tree,
            group: this,
            fromBoard: false,
            haveChild: false,
            x: this.x + this.margin + this.tree.elementsSize * 2,
            y: -this.y + this.margin,
        });
        this.child = this.app.factory.create(Member, {
            app: this.app,
            role: 'child',
            tree: this.tree,
            group: this,
            fromBoard: false,
            haveChild: true,
            x: this.x + this.margin + this.tree.elementsSize,
            y: -this.y + this.margin + this.tree.elementsSize * 2,
        });
    }

    /**
     * Add a Member to the Family Tree
     * @param position {string} - Position of the Member in the Family Tree
     * @param member {object} - Member to add to the Family Tree
     * @param id {number} - id of the Member to add to the Family Tree
     */
    addMember(position, member, id) {
        if (position === 'father' || position === 'mother') {
            this[position].addBrain(member, id);
        }
    }

    /**
     * Procreate the group
     */
    procreate() {
        this.child = NeuralNetwork.evolveFromParents(this.father, this.mother);
    }

    /**
     * Update the Family Group
     * @param ctx {CanvasRenderingContext2D} - Context of the canvas
     */
    update(ctx = this.app.gui.ctx) {
        // UPDATE TOTAL MEMBERS
        let total = 0;
        this.father.brain && total++;
        this.mother.brain && total++;
        this.child.brain && total++;
        this.totalMembers = total;
    }

    /**
     * Draw the relations between the members of the Family Group
     * @param ctx {CanvasRenderingContext2D} - Context of the canvas
     * @param x {number} - x position of the Family Group
     * @param y {number} - y position of the Family Group
     */
    drawRelations(ctx, x, y) {
        // VERTICAL RELATION LEFT
        this.app.gui.get.line({
            ctx,
            x1: x + this.tree.elementsSize / 2,
            y1: y + this.tree.elementsSize,
            x2: x + this.tree.elementsSize / 2,
            y2: y + this.tree.elementsSize * 1.5,
            color: this.father.brain ? '#000000' : '#999999',
        });
        // HORIZONTAL RELATION LEFT
        this.app.gui.get.line({
            ctx,
            x1: x + this.tree.elementsSize / 2,
            y1: y + this.tree.elementsSize * 1.5,
            x2: x + this.tree.elementsSize * 1.5,
            y2: y + this.tree.elementsSize * 1.5,
            color: this.father.brain ? '#000000' : '#999999',
        });
        // VERTICAL RELATION RIGHT
        this.app.gui.get.line({
            ctx,
            x1: x + this.tree.elementsSize * 2.5,
            y1: y + this.tree.elementsSize,
            x2: x + this.tree.elementsSize * 2.5,
            y2: y + this.tree.elementsSize * 1.5,
            color: this.mother.brain ? '#000000' : '#999999',
        });
        // HORIZONTAL RELATION RIGHT
        this.app.gui.get.line({
            ctx,
            x1: x + this.tree.elementsSize * 1.5,
            y1: y + this.tree.elementsSize * 1.5,
            x2: x + this.tree.elementsSize * 2.5,
            y2: y + this.tree.elementsSize * 1.5,
            color: this.mother.brain ? '#000000' : '#999999',
        });
        // VERTICAL RELATION CENTER
        this.app.gui.get.line({
            ctx,
            x1: x + this.tree.elementsSize * 1.5,
            y1: y + this.tree.elementsSize * 1.5,
            x2: x + this.tree.elementsSize * 1.5,
            y2: y + this.tree.elementsSize * 2,
            color: this.father.brain && this.mother.brain ? '#000000' : '#999999',
        });
    }

    /**
     * Draw the Family Group
     * @param ctx {CanvasRenderingContext2D} - Context of the canvas
     */
    draw(ctx) {
        if (this.app.game.state.state === 'NETWORK') {
            // console.log(this.x)
            this.app.gui.get.square({
                ctx,
                x: this.x,
                y: -this.y,
                width: this.width,
                height: this.height,
                stroke: '#000000',
            });
            this.drawRelations(ctx, this.x + this.margin, -this.y + this.margin);
        }
    }
}