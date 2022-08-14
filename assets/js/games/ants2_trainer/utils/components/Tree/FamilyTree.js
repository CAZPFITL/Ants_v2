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
        this.x = -this.width / 2;
        this.y = -this.height / 2;
        this.memberSelected = null;
        this.init();
    }

    /**
     * Initialize the FamilyTree
     */
    init() {
        this.setGroup(0, 1);
        // this.setGroup(0, 2);
        // this.setGroup(1, 3);
        this.app.log.registerEvent(
            `New FamilyTree Created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mFamilyTree\x1b[0m Created`
        );
    }

    selectMember(member) {
        this.memberSelected = member;
    }

    applyBrain(member) {
        this.memberSelected.brain = member.brain;

        if (member === this.app.player.ant) {
            this.app.player.ant = null;
            this.app.factory.remove(member)
        }
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
        if (!this.generations[gen]) this.setGeneration();
        this.generations[gen].push(
            this.app.factory.create(Group,{
                app: this.app,
                id,
                tree: this,
                fromBoard: false,
                haveChild: false,
                x: this.x + this.generations[gen].length * (this.width + this.margin),
                y: -this.y - gen * (this.width + this.margin),
                gen
            })
        );
    }

    /**
     * Count the brains in the FamilyTree
     * @returns {number} - Total of members in the Tree
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

    save() {
        console.log(this.generations);
        const output = this.generations.map((generation) => generation.map((group) => ({
            father: group.father.brain,
            mother: group.mother.brain,
            children: group.child.brain
        })));
        console.log(output);
        localStorage.setItem('familyTree', JSON.stringify(output));
    }

    load() {
        const loadData = JSON.parse(localStorage.getItem('familyTree'));

        this.generations = [];
        for (let i = 0; i < loadData.length; i++) {
            this.generations.push([]);
        }
        this.app.factory.binnacle.Group = null;
        this.app.factory.binnacle.Member = null;

        loadData.forEach((generation) => {
            generation.forEach((group, index) => {
                this.setGroup(index);
            });
        });

        this.generations.forEach((generation, gen) => {
            generation.forEach((group, id) => {
                group.father.brain = loadData[gen][id].father;
                group.mother.brain = loadData[gen][id].mother;
                group.child.brain = loadData[gen][id].children;
            });
        });

        console.log(loadData);
        console.log(this.generations);
    }
}
