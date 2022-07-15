export default class Physics {
    constructor(app) {
        this.app = app;
    }

    walk(entity) {
        const controls = this.app.controls.entity === entity ? this.app.controls : entity.controls;
        const stopRange = 0.03;
        // add frontal and backward speed to the entity
        (controls.forward) && (entity.speed += entity.acceleration);
        (controls.reverse) && (entity.speed -= entity.acceleration);

        // add left and right angle to the entity
        (controls.left) && (entity.angle += entity.turnSpeed);
        (controls.right) && (entity.angle -= entity.turnSpeed);

        // limit the speed to maxSpeed
        (entity.speed > entity.maxSpeed) && (entity.speed = entity.maxSpeed);
        (entity.speed < -entity.maxSpeed) && (entity.speed = -entity.maxSpeed);

        // absolute stop the entity
        (entity.speed > -stopRange) && (entity.speed < stopRange) && (entity.speed = 0);

        // add friction and absolute repose in lower ranges
        (entity.speed > 0) && (entity.speed -= entity.friction);
        (entity.speed < 0) && (entity.speed += entity.friction);

        // this works under the unit circle logic using sin or cos multiplied by speed to get the translation
        entity.x -= Math.sin(entity.angle) * entity.speed;
        entity.y -= Math.cos(entity.angle) * entity.speed;
    }
}