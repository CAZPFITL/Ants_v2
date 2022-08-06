import NeuralNetwork from './Network.js';

export default class FamilyTree {
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

    init() {
        this.setGeneration();
        this.setGroup(0, new Group({
            app: this.app,
            id: 0,
            tree: this,
            fromBoard: false,
            haveChild: false,
            x: this.x,
            y: this.y,
        }));
        this.app.factory.addGameEntity(this);
        this.app.log.registerEvent(
            `New FamilyTree Created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mFamilyTree\x1b[0m Created`
        );
    }

    setGeneration() {
        this.generations.push([]);
    }

    setGroup(gen, group) {
        this.generations[gen].push(group);
    }

    getGroup(gen, group) {
        return this.generations[gen][group];
    }

    getGeneration(gen) {
        return this.generations[gen];
    }

    getMembersTotal() {
        let total = 0;
        this.generations.forEach((generation, gen) => {
            generation.forEach((group, groupIndex) => {
                total += group.totalMembers;
            });
        });
        return total;
    }

    // UPDATE
    updateBoardMeasures() {
        this.margin = this.elementsSize / 2 > this.marginLimit ? this.marginLimit : this.elementsSize / 2;
        this.height = this.elementsSize * 3 + this.margin * 2;
        this.width = this.elementsSize * 3 + this.margin * 2;
        this.x = this.width / 2;
        this.y = this.height / 2;
    }

    updateGroups(ctx) {
        this.generations.forEach((generation, gen) => {
            generation.forEach((group, groupIndex) => {
                group.update(ctx);
            });
        });
    }

    update(ctx = this.app.gui.ctx) {
        if (this.app.game.state.state === 'NETWORK') {
            this.updateBoardMeasures();
            this.updateGroups(ctx);
        }
    }

    // DRAW
    drawBoard(ctx) {
        // DRAW WRAPPER
        this.app.gui.get.square({
            ctx,
            x: -this.x,
            y: -this.y,
            width: this.width,
            height: this.height,
            stroke: '#000',
        });
    }

    drawGroups(ctx) {
        this.generations.forEach((generation, gen) => {
            generation.forEach((group, groupIndex) => {
                group.draw(ctx);
            });
        });
    }

    draw(ctx = this.app.gui.ctx) {
        if (this.app.game.state.state === 'NETWORK') {
            this.drawBoard(ctx);
            this.drawGroups(ctx);
        }
    }
}

class Group {
    constructor({app, tree, id, fromBoard, haveChild, x, y}) {
        this.app = app;
        this.tree = tree;
        this.id = id;
        this.father = null;
        this.mother = null;
        this.child = null;
        this.x = x;
        this.y = y;
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

    updateTotalMembers() {
        let total = 0;
        this.father.brain && total++;
        this.mother.brain && total++;
        this.child.brain && total++;
        this.totalMembers = total;
    }

    // UPDATE
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
        const wrapperX = wrapperW / 2;
        const wrapperY = wrapperH / 2;

        // DRAW WRAPPER
        this.app.gui.get.square({
            ctx,
            x: -wrapperX,
            y: -wrapperY,
            width: wrapperW,
            height: wrapperH,
            stroke: '#000000',
        });

        // Relationships
        this.drawRelations(ctx, -wrapperX + margin, -wrapperY + margin);
        this.drawMembers(ctx, -wrapperX + margin, -wrapperY + margin);
    }
}

class Member {
    constructor({app, group, id, fromBoard, haveChild, x, y}) {
        this.app = app;
        this.group = group;
        this.id = id;
        this.x = x;
        this.y = y;
        this.brain = null;
        this.fromBoard = fromBoard;
        this.haveChild = haveChild;
        this.app.factory.addGameEntity(this);
        this.app.log.registerEvent(
            `New TreeGroup Created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mTreeGroup\x1b[0m Created`
        );
    }

    addBrain(brain, id) {
        this.brain = brain;
        this.id = id;
    }

    draw(ctx, x, y, color) {
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