import Middleware from "../Middleware/Middleware.js";
import State from '../../TypesAndInterfaces/Session.js';

class MiddlewareWorker {
    async handle(state: State, next: () => any, ...middlewares: Middleware[]) {
        if(middlewares.length == 0) await next();

        const executeMiddleware = async (index: number) => {
            if(index < middlewares.length) {
                const middleware = middlewares[index];
                if (index === middlewares.length - 1) {
                    await middleware.handle(state, next);
                } else {
                    await middleware.handle(state, () => executeMiddleware(index + 1));
                }
            }
        };

        await executeMiddleware(0);
    }
}

export default MiddlewareWorker;
