import Scene from "../bot/Scene/Scene.js";
import RequestHelper from "../helpers/RequestHelper.js";
import State from "../TypesAndInterfaces/Session.js";
import Middleware from "../bot/Middleware/Middleware.js";
import Report from "../models/Report.js";
import Admin from "../models/Admin.js";

const invalidData = async(ctx: State) => {
    await ctx.api.reply('Пожалуйста, проверьте отпровляемые данные...\nИли используйте /leave, чтобы выйти.');
};

const sendAdminsNotify = async(ctx: State) => {
    const admins = await Admin.find({ "notifySettings.newReports": true });

    for(const admin of admins) {
        try {
            if(admin.userId != ctx.data?.from?.id) await ctx.api.telegram.sendMessage(admin.userId, 'Новый репорт!\n /view_report, чтобы перейтик просмотру репортов.');
        } catch(err) {
            console.log(err);
        }
    }
};

const scene = new Scene('report', 
    async(ctx) => {
        if(!RequestHelper.isCallback(ctx) || !RequestHelper.callbackDataIs(ctx, 'start', 'leave')) return await invalidData(ctx);

        if(RequestHelper.callbackDataIs(ctx, 'leave')) {
            await ctx.api.telegram.editMessageText('Репорт отменён!', {
                chat_id: ctx.data?.from?.id,
                message_id: ctx.state.messageForEdit
            });

            delete ctx.state.messageForEdit;

            return await ctx.sceneWorker.leave();
        }

        await ctx.api.telegram.editMessageText('Опишите проблему с которой вы столкнулись.', {
            chat_id: ctx.data?.from?.id,
            message_id: ctx.state.messageForEdit
        });

        delete ctx.state.messageForEdit;

        return ctx.sceneWorker.next();
    },
    async(ctx) => {
        if(!RequestHelper.isText(ctx)) return await invalidData(ctx);

        Report.create({
            from:{
                userId: ctx.data?.from?.id,
                userName: ctx.data?.from?.username,
                firstName: ctx.data?.from?.first_name,
            },
            report: ctx.data!.text
        });

        sendAdminsNotify(ctx);

        await ctx.api.reply('Спасибо за обращение! Мы постараемся как можно скорее устарнить ошибку.');

        return await ctx.sceneWorker.leave();
    },
);

scene.command('leave', async(ctx) => {
    if(ctx.state.messageForEdit) await ctx.api.telegram.deleteMessage(ctx.data!.chat.id, ctx.state.messageForEdit);
    await ctx.sceneWorker.leave();
});

scene.enter(async(ctx) => {
    ctx.state.messageForEdit = (await ctx.api.reply(
        'Создать сообщение об ошибке в боте?',
        {
            reply_markup: {
                inline_keyboard: [
                    [ {text: 'Да, написать', callback_data: 'start'}, {text: 'Отмена', callback_data: 'leave'} ]
                ]
            }
        }
    )).message_id;
});

scene.leave(async(ctx) => {
    await ctx.api.reply('Вы вышли из сцены.');
});

export default scene