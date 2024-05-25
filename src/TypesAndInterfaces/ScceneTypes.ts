import Middleware from '../bot/Middleware/Middleware.js';
import State from './Session.js';

export enum ReturnParams {
    next = 'next',
    previous = 'prev',
    leave = 'leave'
}
export type Handler = (state: State) => Promise<void> | void;
export type Step = (state: State, ...args: any[]) => any;
export type LeaveStep = (state: State) => any;
export type EnterStep = (state: State) => any;
export type SceneHandlers = {
    hears: {
        text: string,
        handler: Handler
    }[],
    text: {regex: RegExp, handler: Handler}[],
    command: Map<string, Handler>,
    callback: { 
        handlers: Map<string, Handler>,
        default?: Handler
    },
    middlewares: Middleware[],
    enter?: EnterStep,
    leave?: LeaveStep
};