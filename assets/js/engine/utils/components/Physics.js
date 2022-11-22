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


		this.entityLimits(entity, crashTypes);

		entity.coords.x -= Math.sin(entity.angle) * entity.speed;
		entity.coords.y -= Math.cos(entity.angle) * entity.speed;

	}

	entityLimits(entity, crashTypes) {
		if (!crashTypes instanceof Array || typeof crashTypes !== 'object') return;

		const iterable = crashTypes instanceof Array ? crashTypes : Object.values(crashTypes);
		for (let i = 0; i < iterable.length; i++) {
			if (this.app.gui.get.polysIntersect(entity.polygons, iterable[i].polygons)) {
				const xBound = (this.app.game.level.size.width / 2);
				const yBound = (this.app.game.level.size.height / 2);
				const halfSize = (entity.generatedSize / 2) + 0.2;

				entity.speed = 0;

				// this works for right
				if ((entity.coords.x) > xBound - halfSize) {
					entity.coords.x -= 0.2;
				}
				// this works for left
				else if ((-entity.coords.x) > xBound - halfSize) {
					entity.coords.x += 0.2;
				}
				// this works for bottom
				else  if ((entity.coords.y) > yBound - halfSize) {
					entity.coords.y -= 0.2;
				}
				// this works for top
				else if ((-entity.coords.y) > yBound - halfSize) {
					entity.coords.y += 0.2;
				}
				return
			}
		}
	}

	// isInBound(entity) {
	// 	const coords = entity.coords;
	// 	const limits = this.app.game.level.size;
	// 	return !(coords.x > -limits.width / 2 && coords.x < limits.width / 2) ||
	// 		!(coords.y > -limits.height / 2 && coords.y < limits.height / 2);
	// }

	degrees = (angle) => angle * (180 / Math.PI);

	radians = (angle) => angle * (Math.PI / 180);
}