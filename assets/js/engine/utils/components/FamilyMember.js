export default class Member {
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