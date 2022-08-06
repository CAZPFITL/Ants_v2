import NeuralNetwork from "./Network.js";
import Member from "./FamilyMember.js";

export default class Group {
    constructor({app, tree, id, fromBoard, haveChild, x, y, gen}) {
        this.app = app;
        this.tree = tree;
        this.id = id;
        this.father = null;
        this.mother = null;
        this.child = null;
        this.x = x;
        this.y = y;
        this.gen = gen;
        this.totalMembers = 0;
        this.app.factory.addGameEntity(this);
        this.app.log.registerEvent(
            `New TreeGroup #${this.id} created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mTreeGroup #${this.id}\x1b[0m Created`
        );
        this.init();
    }

    init() {
        this.father = new Member({
            app: this.app,
            group: this,
            fromBoard: false,
            haveChild: false,
            x: this.x,
            y: this.y,
        });
        this.mother = new Member({
            app: this.app,
            group: this,
            fromBoard: false,
            haveChild: false,
            x: this.x,
            y: this.y,
        });
        this.child = new Member({
            app: this.app,
            group: this,
            fromBoard: false,
            haveChild: true,
            x: this.x,
            y: this.y,
        });
    }

    addMember(position, member) {
        if (position === 'father' || position === 'mother') {
            this[position].brain = member;
        }
    }

    procreate() {
        this.child = NeuralNetwork.evolveFromParents(this.father, this.mother);
    }

    // UPDATE
    updateTotalMembers() {
        let total = 0;
        this.father.brain && total++;
        this.mother.brain && total++;
        this.child.brain && total++;
        this.totalMembers = total;
    }

    update(ctx = this.app.gui.ctx) {
        this.updateTotalMembers();
        this.draw(ctx);
    }

    // DRAW
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

    drawMembers(ctx, x, y) {
        this.father.draw(ctx, x, y, this.father.brain ? '#000000' : '#999999');
        this.mother.draw(ctx, x + this.tree.elementsSize * 2, y, this.mother.brain ? '#000000' : '#999999');
        this.child.draw(ctx, x + this.tree.elementsSize, y + this.tree.elementsSize * 2, this.child.brain ? '#000000' : '#999999');
    }

    draw(ctx) {
        const margin = this.tree.elementsSize / 2 > this.tree.marginLimit ? this.tree.marginLimit : this.tree.elementsSize / 2;
        const wrapperW = this.tree.elementsSize * 3 + margin * 2;
        const wrapperH = this.tree.elementsSize * 3 + margin * 2;

        // DRAW WRAPPER
        this.app.gui.get.square({
            ctx,
            x: -this.x,
            y: -this.y,
            width: wrapperW,
            height: wrapperH,
            stroke: '#000000',
        });

        // Relationships
        this.drawRelations(ctx, -this.x + margin, -this.y + margin);
        this.drawMembers(ctx, -this.x + margin, -this.y + margin);
    }
}