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

        //WRAPPER
        const wrapperW = 300;
        const wrapperH = 300;
        const wrapperX = - wrapperW / 2;
        const wrapperY = - wrapperH / 2;

        this.app.gui.get.square({
            ctx,
            x: wrapperX,
            y: wrapperY,
            width: wrapperW,
            height: wrapperH,
            stroke: '#000',
        });
    }
}