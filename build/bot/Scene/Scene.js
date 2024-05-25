class Scene {
    constructor(name, ...steps) {
        this.middlewares = [];
        this.handlers = {
            hears: [],
            text: [],
            command: new Map(),
            callback: {
                handlers: new Map(),
            },
            middlewares: [],
        };
        this.name = name;
        this.steps = steps;
    }
    hears(text, handler) {
        this.handlers.hears.push({ text, handler });
    }
    onText(regex, handler) {
        this.handlers.text.push({ regex, handler });
    }
    command(command, handler) {
        this.handlers.command.set(command, handler);
    }
    callback(callbackData, handler) {
        this.handlers.callback.handlers.set(callbackData, handler);
    }
    onCallback(handler) {
        this.handlers.callback.default = handler;
    }
    use(handler) {
        this.middlewares.push(handler);
    }
    enter(handler) {
        this.handlers.enter = handler;
    }
    leave(handler) {
        this.handlers.leave = handler;
    }
}
export default Scene;
//# sourceMappingURL=Scene.js.map