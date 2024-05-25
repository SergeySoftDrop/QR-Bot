import Middleware from "../bot/Middleware/Middleware.js";
import Admin from "../models/Admin.js";
const conf = {
    chekRate: 30 * 60 * 1000
};
const chek = async (ctx) => {
    ctx.state.lastAdminChek = Date.now();
    return !!await Admin.exists({ userId: ctx.info.userId });
};
export default new Middleware(async (ctx, next) => {
    if (!ctx.state.lastAdminChek)
        ctx.state.isAdmin = await chek(ctx);
    else if (Date.now() - ctx.state.lastAdminChek <= conf.chekRate)
        ctx.state.isAdmin = await chek(ctx);
    await next();
});
//# sourceMappingURL=SetAdmin.js.map