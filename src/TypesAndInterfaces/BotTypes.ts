import State from "./Session.js";
import Middleware from "../bot/Middleware/Middleware.js";

export type Handler = (state: State, args?: any[]) => Promise<void> | any;
export type BotHandlers = {
    hears: {
        text: string,
        handler: Handler
    }[],
    text: {regex: RegExp, handler: Handler}[],
    command: Map<string, Handler>,
    message?: Handler,
    callback: { 
        handlers: Map<string, Handler>,
        default?: Handler
    },
    photo?: Handler,
    middlewares: Middleware[],
};