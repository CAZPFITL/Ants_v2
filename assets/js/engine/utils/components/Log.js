export default class Log {
    constructor(app, callback = (fn) => fn()) {
        this.app = app;
        this.registeredEvents = [];
        this.consoleEvents = [];
        this.printEvents = [];
        callback(()=> {
            this.registerEvent(
                'New Log Created',
                '\x1b[32;1m| \x1b[0mNew \x1b[32mLog\x1b[0m Created'
            );
        });
    }

    registerEvent(event, _console) {
        this.consoleEvents.push(_console);
        this.registeredEvents.push(event);
        (this.app.verbose) && console.log(_console);
    }

    updatePrintEvents() {
        this.printEvents = this.registeredEvents.slice(-5);
    }

    update() {
        this.updatePrintEvents();
    }

    draw() {
        this.app.gui.ctx.font = "12px Arial";
        this.app.gui.ctx.fillStyle = "white";
        this.app.gui.ctx.fillText("Log", 10, 10);
        this.app.gui.ctx.fillText("Events:", 10, 25);
        for (let i = 0; i < this.printEvents.length; i++) {
            this.app.gui.ctx.fillText(this.printEvents[i], 10, 40 + i * 15);
        }
    }
}