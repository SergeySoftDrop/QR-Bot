import LogHelper from "../helpers/LogHelper.js";
import State from "../TypesAndInterfaces/Session.js";
import Middleware from './../bot/Middleware/Middleware.js';

const logAcces = async(ctx: State) => {
    await LogHelper.logAccess(JSON.stringify(ctx.data));
};

const logErr = async(ctx: State, error: any) => {
    await LogHelper.logError(error, ctx);
};

const observeMiddleware = new Middleware(async (ctx, next) => {
    try {
        await next();
        logAcces(ctx);
    } catch (error) {
        try {
            if(ctx.state.sceneState.inScene) await ctx.sceneWorker.leave();
            await ctx.api.reply('<b>Произошла ошибка!</b>\nПожалуйста, повторите попытку ещё раз позже.\nСообщите нам об ошибке через команду /report или напишите по указанным контактам.', {parse_mode: 'HTML'});
        } catch (error) {
            logErr(ctx, error!);
        }
        logErr(ctx, error);
    }
});

export default observeMiddleware
