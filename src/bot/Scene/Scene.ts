import { Step, LeaveStep, EnterStep, SceneHandlers, Handler } from "../../TypesAndInterfaces/ScceneTypes.js";
import Middleware from "../Middleware/Middleware.js";

class Scene {
    public name: string;
    public steps: Step[];

    public middlewares: Middleware[] = [];

    public handlers: SceneHandlers;

    constructor(name: string, ...steps: Step[]) {
        this.handlers = {
            hears: [],
            text: [],
            command: new Map(),
            callback: {
                handlers: new Map(),                
            },
            middlewares: [],
        }

        this.name = name;
        this.steps = steps;
    }

    hears(text: string, handler: Handler) {
        this.handlers.hears.push({ text, handler })
    }

    onText(regex: RegExp, handler: Handler) {
        this.handlers.text.push({regex, handler});
    }
    
    command(command: string, handler: Handler) {
        this.handlers.command.set(command, handler);
    }
    
    callback(callbackData: string, handler: Handler) {
        this.handlers.callback.handlers.set(callbackData, handler);
    }

    onCallback(handler: Handler) {
        this.handlers.callback.default = handler;
    }

    use(handler: Middleware) {
        this.middlewares.push(handler);
    }

    enter(handler: EnterStep) {
        this.handlers.enter = handler;
    }

    leave(handler: LeaveStep) {
        this.handlers.leave = handler;
    }
}

export default Scene;
