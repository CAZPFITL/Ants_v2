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

	move(entity, crashTypes) {
		// limit the speed to maxSpeed
		if (entity.speed > entity.maxSpeed) entity.speed = entity.maxSpeed;
		if (entity.speed < -entity.maxSpeed) entity.speed = -entity.maxSpeed;

		// add friction and absolute repose in lower ranges
		if (entity.speed > 0) entity.speed -= entity.friction;
		if (entity.speed < 0) entity.speed += entity.friction;

		// absolute stop the entity
		if ((entity.speed > -this.stopRange) && (entity.speed < this.stopRange)) entity.speed = 0;

		entity.coords.x -= Math.sin(entity.angle) * entity.speed;
		entity.coords.y -= Math.cos(entity.angle) * entity.speed;

		this.entityLimits(entity, crashTypes);

	}

	entityLimits(entity, crashTypes) {
		if (!crashTypes instanceof Array || typeof crashTypes !== 'object') return;
		const iterable = crashTypes instanceof Array ? crashTypes : Object.values(crashTypes);
		for (let i = 0; i < iterable.length; i++) {
			if (this.app.gui.get.polysIntersect(entity.polygons, iterable[i].polygons)) {
				entity.coords.x -= entity.coords.x < iterable[i].coords.x ? entity.speed : -entity.speed;
				entity.coords.y -=  entity.coords.y < iterable[i].coords.y ? entity.speed : -entity.speed;
			}
		}
	}

	isInBound(entity) {
		const coords = entity.coords;
		const limits = this.app.game.level.size;
		return !(coords.x > -limits.width / 2 && coords.x < limits.width / 2) ||
			!(coords.y > -limits.height / 2 && coords.y < limits.height / 2);
	}
}