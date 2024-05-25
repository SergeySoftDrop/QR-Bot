import Scene from "../bot/Scene/Scene.js";
import Admin from "../models/Admin.js";
import RequestHelper from "../helpers/RequestHelper.js";
const getButtons = async (adminId) => {
    const admin = await Admin.findOne({ userId: adminId });
    return [
        [{
                text: "Новые репорты: " + (admin.notifySettings.newReports ? "ON" : "OFF"),
                callback_data: "newReports_" + (admin.notifySettings.newReports ? "disable" : "enable")
            }],
        [{
                text: "Подозрительные действия: " + (admin.notifySettings.suspiciousActivity ? "ON" : "OFF"),
                callback_data: "suspiciousActivity_" + (admin.notifySettings.suspiciousActivity ? "disable" : "enable")
            }],
        [{
                text: "Выйти",
                callback_data: "leave"
            }]
    ];
};
const sendSettings = async (ctx) => {
    const text = 'Настройки уведомлений:';
    const extra = {
        reply_markup: {
            inline_keyboard: await getButtons(ctx.data.from.id)
        }
    };
    if (!ctx.state.sceneData.editMsgId) {
        ctx.state.sceneData.editMsgId = (await ctx.api.reply(text, extra)).message_id;
    }
    else {
        ctx.api.editMessageText(text, { ...extra, chat_id: ctx.info.chatId, message_id: ctx.state.sceneData.editMsgId });
    }
};
const enable = async (adminId, field) => {
    const update = { [`notifySettings.${field}`]: true };
    await Admin.findOneAndUpdate({ userId: adminId }, { $set: update });
};
const disable = async (adminId, field) => {
    const update = { [`notifySettings.${field}`]: false };
    await Admin.findOneAndUpdate({ userId: adminId }, { $set: update });
};
const handle = async (ctx, field, action) => {
    switch (action) {
        case 'enable':
            await enable(ctx.data?.from?.id, field);
            break;
        case 'disable':
            await disable(ctx.data?.from?.id, field);
            break;
    }
    await sendSettings(ctx);
};
const invalidDataAnswer = async (ctx) => {
    await ctx.api.reply('Невалидные данные. \nПопробуйте ещё раз или /leave, чтобы выйти из сцены.', { parse_mode: 'HTML' });
};
const scene = new Scene('settings', async (ctx) => {
    if (!RequestHelper.isCallback(ctx) || !RequestHelper.callbackDataIs(ctx, /(leave|newReports_.*|suspiciousActivity_.*)/))
        return await invalidDataAnswer(ctx);
    const callbackData = ctx.data.data;
    if (callbackData.startsWith('newReports_') ||
        callbackData.startsWith('suspiciousActivity_')) {
        const [field, action] = callbackData.split('_');
        await handle(ctx, field, action);
    }
    else if (callbackData === 'leave') {
        await ctx.api.telegram.editMessageText('Вы вышли из сцены.', { chat_id: ctx.info.chatId, message_id: ctx.state.sceneData.editMsgId });
        await ctx.sceneWorker.leave();
    }
});
scene.command('leave', async (ctx) => {
    await ctx.api.reply('Вы вышли из сцены.');
    await ctx.sceneWorker.leave();
});
scene.enter(async (ctx) => {
    ctx.state.sceneData = {
        editMsgId: null,
    };
    await sendSettings(ctx);
});
export default scene;
//# sourceMappingURL=Settings.js.map