class MiddlewareWorker {
    async handle(state, next, ...middlewares) {
        if (middlewares.length == 0)
            await next();
        const executeMiddleware = async (index) => {
            if (index < middlewares.length) {
                const middleware = middlewares[index];
                if (index === middlewares.length - 1) {
                    await middleware.handle(state, next);
                }
                else {
                    await middleware.handle(state, () => executeMiddleware(index + 1));
                }
            }
        };
        await executeMiddleware(0);
    }
}
export default MiddlewareWorker;
//# sourceMappingURL=MiddlewareWorker.js.map