class Middleware {
    constructor(handler) {
        this.handler = handler;
    }
    async handle(state, next) {
        return await this.handler(state, next);
    }
}
export default Middleware;
//# sourceMappingURL=Middleware.js.map