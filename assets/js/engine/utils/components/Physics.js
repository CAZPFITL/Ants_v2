export default class Physics {
    constructor(app, callback = (fn) => fn()) {
        this.app = app;
        this.stopRange = 0.08;
        callback(() => {
            this.app.log.registerEvent(
                `New Physics Created`,
                `\x1b[32;1m| \x1b[0mNew \x1b[32;1mPhysics\x1b[0m Created`
            );
        });
    }

    /**
     * Class methods
     */
    // calculate acceleration with physics and not from the ant
    speedup(entity) {
        entity.speed += entity.acceleration;
    }

    slowdown(entity) {
        entity.speed -= entity.acceleration;
    }

    turnLeft(entity) {
        entity.angle += entity.turnSpeed;
    }

    turnRight(entity) {
        entity.angle -= entity.turnSpeed;
    }

    // TODO remove entity and create methods for calculations
    move(entity) {
        // limit the speed to maxSpeed
        if (entity.speed > entity.maxSpeed) entity.speed = entity.maxSpeed;
        if (entity.speed < -entity.maxSpeed) entity.speed = -entity.maxSpeed;

        // add friction and absolute repose in lower ranges
        if (entity.speed > 0) entity.speed -= entity.friction;
        if (entity.speed < 0) entity.speed += entity.friction;

        // absolute stop the entity
        if ((entity.speed > -this.stopRange) && (entity.speed < this.stopRange)) entity.speed = 0;

        // World Limits
        this.worldLimits({
            x: Math.sin(entity.angle) * entity.speed,
            y: Math.cos(entity.angle) * entity.speed
        }, entity);
    }

    worldLimits({x, y}, entity) {
        const coords = entity.coords;
        const borders = this.app.game.level.boundTargets.polygons;
        // Limit Horizontal Movement
        (!this.app.gui.get.polysIntersect(entity.polygons, borders.slice(0, 4)) &&
            !this.app.gui.get.polysIntersect(entity.polygons, borders.slice(5, 8)))
            ? (coords.x -= x) : (coords.x -= coords.x > 0 ? 0.1 : -0.1);
        // Limit Vertical Movement
        (!this.app.gui.get.polysIntersect(entity.polygons, borders.slice(8, 11)) &&
            !this.app.gui.get.polysIntersect(entity.polygons, borders.slice(12, 15)))
            ? (coords.y -= y) : (coords.y -= coords.y > 0 ? 0.1 : -0.1);
    }

    isInBound(entity) {
        const coords = entity.coords;
        const limits = this.app.game.level.size;
        return !(coords.x > -limits.width / 2 && coords.x < limits.width / 2) ||
            !(coords.y > -limits.height / 2 && coords.y < limits.height / 2);
    }
    
    isInBound(entity) {
        const coords = entity.coords;
        const limits = this.app.game.level.size;
        return !(coords.x > -limits.width / 2 && coords.x < limits.width / 2) ||
            !(coords.y > -limits.height / 2 && coords.y < limits.height / 2);
    }
}