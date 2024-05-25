import State from "../TypesAndInterfaces/Session.js";
import Middleware from "../bot/Middleware/Middleware.js";
import Ban from "../models/Ban.js";

const conf = {
    checkRate: 45 * 60 * 1000,
};

const updateBanState = async(ctx: State) => {
    const ban = await Ban.findOne({ userId: ctx.info.userId });

    ctx.state.banState = {
        isBaned: !!ban,
        lastChek: Date.now()
    };

    return ban;
};

export default new Middleware(async(ctx, next) => {
    let ban;

    if(!ctx.state.banState || ctx.state.banState.lastChek + conf.checkRate <= Date.now()) ban = await updateBanState(ctx);    
    
    if(ctx.state.banState.isBaned) {
        if(!ctx.state.banState.msgSended) {
            await ctx.api.reply(
                `<b>Вы были заблокированы.</b>\n` +
                `Ваш бан-ID: ${ban!._id.toString()}\n` +
                `Причина: ${ban!.reason}\n` +
                `\nЕсли Вы были заблокированны по ошибке или хотите выйти из блокировки, то свяжитесь с нами через контакты, указанные в боте.\n` +
                `Укажите ID бана в обращении.`, 
                {parse_mode: 'HTML'}
            );
    
            ctx.state.banState.msgSended = true;
        }
    } else {
        await next();
    }
});