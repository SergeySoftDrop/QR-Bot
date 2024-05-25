import State from "../../TypesAndInterfaces/Session.js";

type MiddlewareHandler = (state: State, next: () => any) => Promise<boolean | void> | boolean | void;

class Middleware {
    constructor(private handler: MiddlewareHandler) { }

    async handle<T>(state: State, next: () => T) {
        return await this.handler(state, next);
    }
}

export default Middleware