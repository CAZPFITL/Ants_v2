import NeuralNetwork from './Network.js';
import Group from './FamilyGroup.js';

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
        this.setGroup(0);
        this.app.factory.addGameEntity(this);
        this.app.log.registerEvent(
            `New FamilyTree Created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mFamilyTree\x1b[0m Created`
        );
    }

    setGeneration() {
        this.generations.push([]);
    }

    setGroup(gen) {
        this.generations[gen].push(
            new Group({
                app: this.app,
                id: 0,
                tree: this,
                fromBoard: false,
                haveChild: false,
                x: this.x,
                y: this.y,
                gen
            })
        );
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
    drawGroups(ctx) {
        this.generations.forEach((generation, gen) => {
            generation.forEach((group, groupIndex) => {
                group.draw(ctx);
            });
        });
    }

    draw(ctx = this.app.gui.ctx) {
        if (this.app.game.state.state === 'NETWORK') {
            this.drawGroups(ctx);
        }
    }
}
