export default class Physics {
    constructor(app) {
        this.app = app;
        this.stopRange = 0.03;
    }

    // TODO remove entity and create methods for calculations
    walk(entity) {
        // limit the speed to maxSpeed
        (entity.speed > entity.maxSpeed) && (entity.speed = entity.maxSpeed);
        (entity.speed < -entity.maxSpeed) && (entity.speed = -entity.maxSpeed);

        // absolute stop the entity
        (entity.speed > -this.stopRange) && (entity.speed < this.stopRange) && (entity.speed = 0);

        // add friction and absolute repose in lower ranges
        (entity.speed > 0) && (entity.speed -= entity.friction);
        (entity.speed < 0) && (entity.speed += entity.friction);

        // this works under the unit circle logic using sin or cos multiplied by speed to get the translation
        entity.x -= Math.sin(entity.angle) * entity.speed;
        entity.y -= Math.cos(entity.angle) * entity.speed;
    }
}