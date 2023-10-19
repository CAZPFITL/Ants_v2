import {
	COLORS,
	gameInstructionsText
} from "../../env.js";

export default class Screen {
	constructor(app, gui) {
		this.app = app;
		this.gui = gui;
		this.hoverCollection = {};
		this.decorations = {};
		this.buttonsStates = {};
		this.buttonsCollection = {};
		this.abstractStates = {};
		this.screenData = () => {
			const dec = this.app.tools.xDec
			const player = {
				name: `Ant #${this.app.player?.ant?.id ?? 'N/A'} Anthill #${this.app.player?.anthill?.id ?? 'N/A'}`,
				energy: dec((this.app.player?.ant?.energy ?? 1) * 10, 2) ?? 0,
				maxFoodPickCapacity: this.app.player?.ant?.maxFoodPickCapacity ?? 100,
				maxPickedFood: this.app.player?.ant?.maxPickedFood ?? 0,
				pickedFood: this.app.player?.ant?.pickedFood ?? 0,
			};
			this.declareElements({
				dec,
				player,
				antHill: this.app.player?.anthill ?? {},
				entity: this.app.player?.ant,
				height: 190,
				width: this.app.tools.max([this.app.game.gui.controlsCtx.measureText(`Player: ${player.name}`).width, 240]),
				cardPosition: {x: 10, y: 10}
			});
			this.followPlayer();
			this.app.log.printLog(this.app.game.gui.controlsCtx, "20px Mouse");
		};
		this.#addListeners({
			mousemove: (event, hoverTranslatedCoords) => {
				// MOVE CREATION
				if (this.abstractStates.creating) {
					if (this.creation?.coords) {
						(this.creation.coords = hoverTranslatedCoords);
					} else {
						this.creation.x = hoverTranslatedCoords?.x;
						this.creation.y = hoverTranslatedCoords?.y;
					}
				}
			},
			mouseup: () => true,
			mousedown: (event) => {
				// PLACE CREATION
				if (this.abstractStates.creating) {
					const safeGap = 20;
					const objWidth = (this.creation?.size?.width ?? this.creation.width);
					const objHeight = (this.creation?.size?.height ?? this.creation.height);
					const map = {
						x: (-this.app.game.level.size.width + objWidth) / 2 + safeGap,
						y: (-this.app.game.level.size.height + objHeight) / 2 + safeGap,
						width: this.app.game.level.size.width - objWidth - safeGap * 2,
						height: this.app.game.level.size.height - objHeight - safeGap * 2
					}
					const click = this.app.gui.get.viewportCoords(
						{x: event.offsetX, y: event.offsetY},
						this.app.camera.viewport
					);
					if (this.app.gui.get.isHover(map, click)) {
						this.creation = null;
						this.abstractStates.creating = false;
						this.buttonsStates.createAnthill = 'normal';
						this.buttonsStates.createFood = 'normal';
					}
				}
			},
			click: () => true,
		});
	}

	#addListeners(abstractEvents) {
		this.app.controls.pushListener(this, 'mousemove', (event) => {
			const buttons = this.#getButtons()
			const hoverTranslatedCoords = this.app.gui.get.viewportCoords({
				x: event.offsetX,
				y: event.offsetY
			}, this.app.camera.viewport);

			this.app.player.anthill.target = hoverTranslatedCoords;

			// ABSTRACT MOVE
			abstractEvents.mousemove(event, hoverTranslatedCoords);
			// MOUSE MOVE
			Object.keys(buttons).forEach((key) =>
				buttons[key].props?.callbacks?.mousemove &&
				buttons[key].props.callbacks.mousemove(event, hoverTranslatedCoords));
			// HOVER READ
			this.app.gui.get.checkHoverCollection({
				collection: this.hoverCollection,
				event,
				viewport: this.app.camera.viewport,
				isHover: (key) => {
					if (this.buttonsStates[key] !== 'click' && this.buttonsStates[key] !== 'hover') {
						this.buttonsStates[key] = 'hover';
						this.hoverCaller = key;
						this.gui.hoverStateIn();
					}
				},
				isOut: (key) => {
					if (this.buttonsStates[key] !== 'click' && this.buttonsStates[key] !== 'normal') {
						this.buttonsStates[key] = 'normal';
						this.hoverCaller = null;
						this.gui.hoverStateOut();
					}
				},
				caller: this.hoverCaller,
			});
		});
		this.app.controls.pushListener(this, 'mouseup', (event) => {
			const buttons = this.#getButtons()
			Object.keys(buttons).forEach((key) => {
				const ctx = buttons[key].props.position === 'viewport'
					? this.app.gui.get.clickCoords(event, this.app.camera.viewport)
					: {x: event.offsetX, y: event.offsetY};

				this.app.gui.get.isClicked(
					buttons[key].props,
					ctx,
					() => buttons[key].props?.callbacks?.mouseup && buttons[key].props.callbacks.mouseup(event)
				)
			});
			abstractEvents.mouseup(event);
		});
		this.app.controls.pushListener(this, 'mousedown', (event) => {
			const buttons = this.#getButtons()

			Object.keys(buttons).forEach((key) => {
				if (!buttons[key].props?.ctx) return;
				const ctx = buttons[key].props.position === 'viewport'
					? this.app.gui.get.clickCoords(event, this.app.camera.viewport)
					: {x: event.offsetX, y: event.offsetY};

				this.app.gui.get.isClicked(
					buttons[key].props,
					ctx,
					() => buttons[key].props?.callbacks?.mousedown && buttons[key].props.callbacks.mousedown(event)
				)
			});
			abstractEvents.mousedown(event);
		});
		this.app.controls.pushListener(this, 'click', (event) => {
			const buttons = this.#getButtons()

			Object.keys(buttons).forEach((key) => {
				const ctx = buttons[key].props.position === 'viewport'
					? this.app.gui.get.clickCoords(event, this.app.camera.viewport)
					: {x: event.offsetX, y: event.offsetY};

				this.app.gui.get.isClicked(
					buttons[key].props,
					ctx,
					() => buttons[key].props?.callbacks?.click && buttons[key].props.callbacks.click(event)
				)
			});

			abstractEvents.click(event);
		});
	}

	#getButtons() {
		const output = {};
		Object.entries(this.buttonsCollection).forEach(key => {
			if (key[0] !== this.app.game.state.state) return;
			Object.entries(key[1]).forEach(button => output[button[0]] = button[1]);
		})
		return output;
	}

	followPlayer() {
		if (this.app.game.state.state === 'PLAY' && this.app.game.level) {
			if (!this.app.player?.ant?.speed) return;
			this.app.player.followCamera &&
			this.app.player.ant.speed !== 0 &&
			this.app.camera.follow(this.app.player?.ant);
		}
	}

	declareElements({dec, player, antHill, entity, height, width, cardPosition}) {
		this.colors = {
			MAIN_MENU: {
				background: COLORS.GREEN[0],
				buttons: {
					variation1: {
						hover: COLORS.YELLOW[2],
						click: COLORS.YELLOW[0],
						normal: COLORS.YELLOW[1],
						stroke: COLORS.BLACK[0],
					}
				},
				mainCard: {
					text: COLORS.WHITE[0],
					background: COLORS.BROWN[0],
					color: COLORS.BLACK[0],
				}
			},
			PLAY: {
				background: COLORS.GREEN[0],
			}
		};

		const mainMenuButtonMeasure = {
			width: 300,
			height: 50
		};

		const mainMenuButtonBase = {
			x: -(mainMenuButtonMeasure.width / 2),
			y: -100,
			space: 30,
			...mainMenuButtonMeasure
		};

		const mainMenuCardSize = {
			width: mainMenuButtonMeasure.width + 150,
			height: 500,
		};

		const displacement = (mainMenuButtonBase.height + mainMenuButtonBase.space);

		this.buttonsCollection = {
			MAIN_MENU: {
				start: {
					type: 'button',
					props: {
						position: 'viewport',
						ctx: this.app.gui.ctx,
						...mainMenuButtonBase,
						x: mainMenuButtonBase.x,
						y: mainMenuButtonBase.y + (0),
						text: 'Start',
						font: '16px Mouse',
						bg: this.buttonsStates.start === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
							: this.buttonsStates.start === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
								: this.colors.MAIN_MENU.buttons.variation1.normal,
						stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
						widthStroke: 8,
						callbacks: {
							mouseup: () => {
								this.app.game.state.setState('PLAY');
								this.app.game.useMusicBox && this.app.musicBox.play();
								this.app.camera.zoom = this.app.camera.maxZoom / 2.4;
							}
						}
					}
				},
				instructions: {
					type: 'button',
					props: {
						position: 'viewport',
						ctx: this.app.gui.ctx,
						...mainMenuButtonBase,
						x: mainMenuButtonBase.x,
						y: mainMenuButtonBase.y + (displacement),
						text: 'Instructions',
						font: '16px Mouse',
						bg: this.buttonsStates.instructions === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
							: this.buttonsStates.instructions === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
								: this.colors.MAIN_MENU.buttons.variation1.normal,
						stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
						widthStroke: 8,
						callbacks: {
							mouseup: () => {
								this.app.game.state.setState('INSTRUCTIONS');
							}
						}
					}
				},
				controls: {
					type: 'button',
					props: {
						position: 'viewport',
						ctx: this.app.gui.ctx,
						...mainMenuButtonBase,
						x: mainMenuButtonBase.x,
						y: mainMenuButtonBase.y + (displacement * 2),
						text: 'Controls',
						font: '16px Mouse',
						bg: this.buttonsStates.controls === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
							: this.buttonsStates.controls === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
								: this.colors.MAIN_MENU.buttons.variation1.normal,
						stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
						widthStroke: 8,
						callbacks: {
							mouseup: () => {
								this.app.game.state.setState('CONTROLS');
							}
						}
					}
				},
				login: {
					type: 'button',
					props: {
						position: 'viewport',
						ctx: this.app.gui.ctx,
						...mainMenuButtonBase,
						x: mainMenuButtonBase.x,
						y: mainMenuButtonBase.y + (displacement * 3),
						text: 'Login',
						font: '16px Mouse',
						bg: this.buttonsStates.login === 'hover' ? COLORS.BLACK[5]
							: this.buttonsStates.login === 'click' ? COLORS.BLACK[5]
								: COLORS.BLACK[6],
						stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
						widthStroke: 8
					}
				},
			},
			// PLAY: {
			// 	forward: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 120,
			// 			y: this.gui.controlsCtx.canvas.height - 120,
			// 			width: 50,
			// 			height: 50,
			// 			text: '↑',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.forward === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.forward === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				mousedown: () => this.app.player.controls.forward = 1,
			// 				mouseup: () => this.app.player.controls.forward = 0
			// 			},
			// 		}
			// 	},
			// 	reverse: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 120,
			// 			y: this.gui.controlsCtx.canvas.height - 60,
			// 			width: 50,
			// 			height: 50,
			// 			text: '↓️',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.reverse === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.reverse === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				mousedown: () => this.app.player.controls.reverse = 1,
			// 				mouseup: () => this.app.player.controls.reverse = 0
			// 			},
			// 		}
			// 	},
			// 	left: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 180,
			// 			y: this.gui.controlsCtx.canvas.height - 60,
			// 			width: 50,
			// 			height: 50,
			// 			text: '←',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.left === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.left === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				mousedown: () => this.app.player.controls.left = 1,
			// 				mouseup: () => this.app.player.controls.left = 0
			// 			},
			// 		}
			// 	},
			// 	right: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 60,
			// 			y: this.gui.controlsCtx.canvas.height - 60,
			// 			width: 50,
			// 			height: 50,
			// 			text: '→️',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.right === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.right === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				mousedown: () => this.app.player.controls.right = 1,
			// 				mouseup: () => this.app.player.controls.right = 0
			// 			},
			// 		}
			// 	},
			// 	pick: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 60,
			// 			y: 70,
			// 			width: 50,
			// 			height: 50,
			// 			text: '🚚',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.pick === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.pick === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				mousedown: () => this.app.player.controls.pick = 1,
			// 				mouseup: () => this.app.player.controls.pick = 0
			// 			},
			// 		}
			// 	},
			// 	eat: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 60,
			// 			y: 130,
			// 			width: 50,
			// 			height: 50,
			// 			text: '🍏',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.eat === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.eat === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				mousedown: () => this.app.player.controls.eat = 1,
			// 				mouseup: () => this.app.player.controls.eat = 0
			// 			},
			// 		}
			// 	},
			// 	createAnt: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 60,
			// 			y: 10,
			// 			width: 50,
			// 			height: 50,
			// 			text: '🐜',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.createAnt === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.createAnt === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				click: () => this.app.player.anthill.addAnt()
			// 			}
			// 		}
			// 	},
			// 	createAnthill: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 120,
			// 			y: 10,
			// 			width: 50,
			// 			height: 50,
			// 			text: '🐝',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.createAnthill === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.createAnthill === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				mouseup: () => {
			// 					if (this.buttonsStates.createAnthill !== 'click') {
			// 						this.abstractStates.creating = true;
			// 						this.buttonsStates.createAnthill = 'click';
			// 						this.app.game.level.Anthill({ants: 0, free: true});
			// 						this.creation = this.app.factory.binnacle.Anthill[this.app.factory.binnacle.Anthill.length - 1];
			// 					}
			// 				}
			// 			}
			// 		}
			// 	},
			// 	sound: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 60,
			// 			y: 190,
			// 			width: 50,
			// 			height: 50,
			// 			text: '🔈',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.sound === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.sound === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				click: () => this.app.musicBox.song.song.volume = !this.app.musicBox.song.song.volume
			// 			}
			// 		}
			// 	},
			// 	createQueen: {
			// 		type: 'button',
			// 		props: {
			// 			position: 'controls',
			// 			ctx: this.app.game.gui.controlsCtx,
			// 			x: this.gui.controlsCtx.canvas.width - 120,
			// 			y: 70,
			// 			width: 50,
			// 			height: 50,
			// 			text: '👑',
			// 			font: '16px Mouse',
			// 			bg: this.buttonsStates.createQueen === 'hover' ? this.colors.MAIN_MENU.buttons.variation1.hover
			// 				: this.buttonsStates.createQueen === 'click' ? this.colors.MAIN_MENU.buttons.variation1.click
			// 					: this.colors.MAIN_MENU.buttons.variation1.normal,
			// 			stroke: this.colors.MAIN_MENU.buttons.variation1.stroke,
			// 			widthStroke: 2,
			// 			callbacks: {
			// 				click: () => {
			// 					if (this.app.player.anthill.food > 999) {
			// 						console.log('create a queen');
			// 					} else {
			// 						console.log('you need more food to create a queen');
			// 						this.app.player.anthill.food = this.app.player.anthill.food - 1000;
			// 					}
			// 				}
			// 			}
			// 		}
			// 	}
			// }
		};

		const instrucctions = {}

		for(let i = 0; i < gameInstructionsText.length; i++) {
			const index = 'text_' + i;
			instrucctions[index] = {
				type: 'text',
				props: {
					ctx: this.app.gui.ctx,
					font: '21px Mouse',
					text: gameInstructionsText[i],
					x: 0,
					y: -160 + (i * 30),
					color: this.colors.MAIN_MENU.mainCard.text,
					width: 0,
					height: 0,
					center: true
				}
			}
		}

		this.decorations = {
			MAIN_MENU: {
				main_card: {
					type: 'square',
					props: {
						ctx: this.app.gui.ctx,
						x: -(mainMenuCardSize.width / 2),
						y: -(mainMenuCardSize.height / 2),
						...mainMenuCardSize,
						color: this.colors.MAIN_MENU.mainCard.background,
						stroke: this.colors.MAIN_MENU.mainCard.color,
						widthStroke: 5
					}
				},
				title: {
					type: 'text',
					props: {
						ctx: this.app.gui.ctx,
						font: '72px Mouse',
						text: this.app.game.constructor.name,
						x: 0,
						y: mainMenuButtonBase.y - 50,
						// y: -(mainMenuButtonMeasure.height * (Object.keys(this.buttonsCollection.MAIN_MENU).length / 2) + 20),
						color: this.colors.MAIN_MENU.mainCard.text,
						width: 0,
						height: 0,
						center: true
					}
				}
			},
			PLAY: {
				data_card: {
					type: 'square',
					props: {
						ctx: this.app.game.gui.controlsCtx,
						x: cardPosition.x,
						y: cardPosition.y,
						width: width + 35,
						height,
						color: COLORS.WHITE[4],
						stroke: COLORS.BLACK[0]
					}
				},
				player_entity: {
					type: 'text',
					props: {
						ctx: this.app.game.gui.controlsCtx,
						font: "20px Mouse",
						color: '#000000',
						text: `Player: ${player.name}`,
						x: cardPosition.x + 15,
						y: cardPosition.y + 30,
					}
				},
				anthill_data: {
					type: 'text',
					props: {
						ctx: this.app.game.gui.controlsCtx,
						font: "20px Mouse",
						color: '#000000',
						text: `Anthill Ants: ${antHill?.antCounter ?? "n/a"}`,
						x: cardPosition.x + 15,
						y: cardPosition.y + 60,
					}
				},
				food_data: {
					type: 'text',
					props: {
						ctx: this.app.game.gui.controlsCtx,
						font: "20px Mouse",
						color: '#000000',
						text: `Anthill Food: ${dec(antHill?.food ?? 0, 0)}`,
						x: cardPosition.x + 15,
						y: cardPosition.y + 90,
					}
				},
				food_bar: {
					type: 'bar',
					props: {
						ctx: this.app.game.gui.controlsCtx,
						x: cardPosition.x + 15,
						y: cardPosition.y + 125,
						text: `Picked Food: ${dec(player.pickedFood, 0)} / ${dec(player.maxFoodPickCapacity, 0)}`,
						// cap: (entity?.maxFoodPickCapacity ?? 10) * 10,
						cap: 245,
						fill: (entity?.pickedFood ?? 1) / (entity?.maxFoodPickCapacity ?? 10) * 245,
						fillColor: 'green-red',
						barColor: COLORS.BLACK[6],
						stroke: COLORS.BLACK[0],
						negative: false,
					}
				},
				energy_bar: {
					type: 'bar',
					props: {
						ctx: this.app.game.gui.controlsCtx,
						x: cardPosition.x + 15,
						y: cardPosition.y + 165,
						text: `Energy: ${dec(player.energy / 10, 0)} / ${100}`,
						cap: 245,
						fill: entity?.energy / 100 * 245,
						fillColor: 'red-green',
						barColor: COLORS.BLACK[6],
						stroke: COLORS.BLACK[0],
						negative: false,
					}
				},
				antCounter: {
					type: 'text',
					props: {
						ctx: this.app.game.gui.controlsCtx,
						font: "20px Mouse",
						text: `${this?.app?.factory?.binnacle?.Ant?.length ?? 0} Ants`,
						x: 10,
						y: window.innerHeight - 10,
					}
				}
			},
			INSTRUCTIONS: {
				card: {
					type: 'square',
					props: {
						ctx: this.app.gui.ctx,
						x: -450,
						y: -(mainMenuCardSize.height / 2),
						width: 900,
						height: 500,
						color: this.colors.MAIN_MENU.mainCard.background,
						stroke: this.colors.MAIN_MENU.mainCard.color,
						widthStroke: 5
					}
				},
				title: {
					type: 'text',
					props: {
						ctx: this.app.gui.ctx,
						font: '31px Mouse',
						text: 'Game Instructions',
						x: 0,
						y: -200,
						color: this.colors.MAIN_MENU.mainCard.text,
						width: 0,
						height: 0,
						center: true
					}
				},
				...instrucctions,
				image: {
					type: 'square',
					props: {
						ctx: this.app.gui.ctx,
						x: -0,
						y: -0,
						width: 90,
						height: 90,
						color: this.colors.MAIN_MENU.mainCard.background,
						stroke: this.colors.MAIN_MENU.mainCard.color,
						widthStroke: 5
					}
				}
			}
		};
	}

	update() {
		this.screenData();
	}

	draw() {
		// DECLARE COLLECTION
		const collection = [
			...Object.values(this?.decorations[this?.app?.game?.state?.state] ?? {}),
			...Object.values(this?.buttonsCollection[this?.app?.game?.state?.state] ?? {}),
		];
		// DRAW COLLECTION
		for (let i = 0; i < collection.length; i++) {
			try {
				const item = collection[i];
				if (typeof this?.app?.gui?.get[item?.type] === 'function') {
					this.app.gui.get[item.type](item.props);
				}
			} catch (error) {
				console.error(
					'verify item.props are provided with next keys:' +
					'position, ctx, x, y, width, height, text, font, bg, stroke, widthStroke, callbacks' +
					error
				);
				debugger;
			}
		}
		// CLEAR HOVER COLLECTION
		this.hoverCollection = {};
		// HOVER EVENTS
		Object.entries(this.buttonsCollection[this.app.game.state.state] ?? {}).forEach(key => {
			this.hoverCollection[key[0]] = key[1].props;
		});
		// CANVAS BACKGROUND
		if (!this?.colors[this?.app?.game?.state?.state]?.background) return;

		this.app.gui.ctx.canvas.style.backgroundColor = this.colors[this.app.game.state.state].background;
	}
}