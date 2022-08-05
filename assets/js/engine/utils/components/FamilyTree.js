export default class FamilyTree {
    constructor({app}) {
        this.app = app;
        this.members = [];
        this.get = FamilyTree;
        this.app.factory.addGameEntity(this);
        this.app.log.registerEvent(
            `New FamilyTree Created`,
            `\x1b[32;1m| \x1b[0mNew \x1b[32;1mFamilyTree\x1b[0m Created`
        );
    }

    /**
     * place a new parent if the facadeRules are met
     *
     * a parent can come from the board and from a born child
     * - if the parent is from the board then place player's ant in new position
     * - if the parent is from a born child then clone child in new position
     * @param origin
     */
    placeParent({origin}) {
        // create a parent from player ant
        if (origin === 'board') {
            // place player's ant in new position
        }

        // create a parent from a born child
        if (origin === 'child') {
            // clone child in new position
        }
    }

    /**
     * create a child from two parents
     *
     * This method expects to receive two parents and create a new parent
     * no facade rules are applied since the parents are already verified
     *
     * - ban parents from procreate
     * - create a child
     * - make the child a possible parent
     */
    bornChild() {
    }

    /**
     * allows to use a parent if no generational or pre-used conflict is detected (detects conflicts to be a parent)
     *
     * - if the difference in generations from both parents is less than 2 then they can procreate
     * - if the difference in generations from both parents is greater than 2 then they can't procreate
     * - if the new parent had a child before it can't be used as parent
     *
     */
    rulesFacade() {
    }

    draw(ctx = this.app.gui.ctx) {
        if (this.app.game.state.state !== 'NETWORK') {
            return;
        }

        const drawBoard = (elementsSize = 40, limit = 60) => {
            //WRAPPER
            const margin = elementsSize / 2 > limit ? limit : elementsSize / 2;
            const wrapperW = elementsSize * 3 + margin * 2;
            const wrapperH = elementsSize * 3 + margin * 2;
            const wrapperX = wrapperW / 2;
            const wrapperY = wrapperH / 2;
            // DRAW WRAPPER
            this.app.gui.get.square({
                ctx,
                x: -wrapperX,
                y: -wrapperY,
                width: wrapperW,
                height: wrapperH,
                stroke: '#000',
            });

            // DRAW BOARD
            const drawNuclearFamilyTree = (x, y) => {
                // DRAW PARENT
                const drawElement = (x, y, level = 0) => {
                    this.app.gui.get.square({
                        ctx,
                        x,
                        y,
                        width: elementsSize,
                        height: elementsSize,
                        color: '#FFF',
                        stroke: '#000'
                    });

                    ctx.fillStyle = '#000';
                    ctx.font = `${elementsSize / 2}px Mouse`;
                    ctx.fillText(String(level), x + elementsSize / 2 - (elementsSize / 8), y + elementsSize / 2 + (elementsSize / 5));
                }

                // DRAW RELATIONS
                const drawRelations = (x, y) => {
                    // RELATION 1
                    this.app.gui.get.line({
                        ctx,
                        x1: x + elementsSize / 2,
                        y1: y + elementsSize,
                        x2: x + elementsSize / 2,
                        y2: y + elementsSize * 1.5,
                        color: '#000',
                    });
                    // RELATION 2
                    this.app.gui.get.line({
                        ctx,
                        x1: x + elementsSize * 2.5,
                        y1: y + elementsSize,
                        x2: x + elementsSize * 2.5,
                        y2: y + elementsSize * 1.5,
                        color: '#000',
                    });
                    // RELATION 3
                    this.app.gui.get.line({
                        ctx,
                        x1: x + elementsSize * 1.5,
                        y1: y + elementsSize * 1.5,
                        x2: x + elementsSize * 1.5,
                        y2: y + elementsSize * 2,
                        color: '#000',
                    });
                    // UNION
                    this.app.gui.get.line({
                        ctx,
                        x1: x + elementsSize / 2,
                        y1: y + elementsSize * 1.5,
                        x2: x + elementsSize * 2.5,
                        y2: y + elementsSize * 1.5,
                        color: '#000',
                    });
                }

                // Father
                drawElement(x, y, 0);
                // Mother
                drawElement(x + elementsSize * 2, y, 0);
                // Children
                drawElement(x + elementsSize, y + elementsSize * 2, 0);
                // Relationships
                drawRelations(x, y);
            }
            //
            // const generations = [{elements: 4}, {elements: 2}];
            //
            // generations.forEach(generation => {
            //     for (let i = 0; i < generation.elements; i++) {
            //
            //     }
            //     drawNuclearFamilyTree(-wrapperX + margin, -wrapperY + margin, 0);
            //     drawNuclearFamilyTree(wrapperX + margin, -wrapperY + margin, 0);
            //
            //
            // });
            drawNuclearFamilyTree(-wrapperX + margin, -wrapperY + margin, 0);
            drawNuclearFamilyTree(wrapperX + margin, -wrapperY + margin, 0);

            drawNuclearFamilyTree(wrapperX * 3 + margin, -wrapperY + margin, 0);
            drawNuclearFamilyTree(wrapperX * 5 + margin, -wrapperY + margin, 0);

            drawNuclearFamilyTree(-wrapperX * 0.5 + margin, wrapperY + margin, 0);
            drawNuclearFamilyTree(wrapperX + margin, wrapperY + margin, 0);
        }

        drawBoard(100);
    }
}