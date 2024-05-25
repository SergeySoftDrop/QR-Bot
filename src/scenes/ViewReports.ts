import TelegramBot from "node-telegram-bot-api";
import Scene from "../bot/Scene/Scene.js";
import Report, { IReport } from "../models/Report.js";
import MongooseHelper from "../helpers/MongooseHelper.js";
import State from "../TypesAndInterfaces/Session.js";
import RequestHelper from "../helpers/RequestHelper.js";

const getButtons = (next: boolean, prev: boolean, totalPages: number): TelegramBot.InlineKeyboardButton[][] => {    
    const buttons = [
        [{ text: 'Удалить', callback_data: 'delete' }],
        [{ text: 'Выйти', callback_data: 'leave' }]
    ];

    if (totalPages > 1) {
        const prevButtonText = prev ? '«' : 'В конец';
        const nextButtonText = next ? '»' : 'В начало';

        buttons[0].unshift({ text: prevButtonText, callback_data: 'prev' });
        buttons[0].push({ text: nextButtonText, callback_data: 'next' });
    }

    return buttons;
};

const parseItemToText = (report: IReport): string => {
    return `<b>Report ${report._id}</b>\n\n` + 
        `<b>Пользователь</b>` +
        `\n\tID: ${report.from.userId}` +
        `\n\tUsername: ${report.from.userName}` +
        (report.from.firstName ? `\n\tFirst Name: ${report.from.firstName}` : '') + "\n" +
        `\n<b>Репорт</b>\n` +
        `${report.report}`;
};

const getItem = async (ctx: State): Promise<IReport | null> => {
    const sceneData = ctx.state.sceneData;
    const paginateRes = await MongooseHelper.paginate<IReport>(Report, sceneData.page, 1);

    sceneData.next = paginateRes.hasNext;
    sceneData.prev = paginateRes.hasPrev;
    sceneData.totalPages = paginateRes.totalPages;
    sceneData.currentItem = paginateRes.results[0] || null;

    return sceneData.currentItem;
};

const sendReport = async (ctx: State) => {
    const item = await getItem(ctx);

    let text, extra;

    if(!item) {
        text = 'Репортов нет!';
        extra = {};
        ctx.sceneWorker.leave();
    } else {
        text = parseItemToText(item);
        extra = { 
            reply_markup: { 
                inline_keyboard: getButtons(ctx.state.sceneData.next, ctx.state.sceneData.prev, ctx.state.sceneData.totalPages) 
            },
            parse_mode: 'HTML'
        };
    }


    if(ctx.state.sceneData.msgIdForEdit) {
        try{
            const res = await ctx.api.editMessageText(text, {
                ...extra,
                chat_id: ctx.info.chatId,
                message_id: ctx.state.sceneData.msgIdForEdit
            } as TelegramBot.EditMessageTextOptions);
    
            return res as TelegramBot.Message;
        } catch(err) {
            console.log(err);
        }
    } else {
        return await ctx.api.reply(text, extra as TelegramBot.SendMessageOptions);
    }
};

const invalidDataAnswer = async (ctx: State) => {
    await ctx.api.reply('Невалидные данные. \nПопробуйте ещё раз или /leave, чтобы выйти из сцены.', { parse_mode: 'HTML' });
};

const handle = async (ctx: State, data: string) => {
    const sceneData = ctx.state.sceneData;

    switch (data) {
        case 'next':
            sceneData.page = sceneData.next ? sceneData.page + 1 : 1;
            break;
        case 'prev':
            sceneData.page = sceneData.prev ? sceneData.page - 1 : sceneData.totalPages;
            break;
        case 'delete':
            if (sceneData.currentItem) await Report.findByIdAndDelete(sceneData.currentItem._id);
            sceneData.page = sceneData.page > 1 ? sceneData.page - 1 : 1;
            break;
        case 'leave':
            await ctx.sceneWorker.leave();
            return;
        default:
            await invalidDataAnswer(ctx);
            return;
    }

    const msg = await sendReport(ctx);
    if(msg) ctx.state.sceneData.msgIdForEdit = msg.message_id;
};

const scene = new Scene('viewReports',
    async (ctx, action?: string) => {
        if((!RequestHelper.isCallback(ctx) || !RequestHelper.callbackDataIs(ctx, 'next', 'prev', 'delete', 'leave')) && !action) return await invalidDataAnswer(ctx);

        await handle(ctx, action ?? ctx.data!.data);
    }
);

scene.command('leave', async(ctx) => {
    await ctx.sceneWorker.leave();
});

scene.enter(async (ctx) => {
    ctx.state.sceneData = {
        page: 1,
        totalPages: 0,
        currentItem: null,
        next: false,
        prev: false,
        msgIdForEdit: null
    };

    const msg = await sendReport(ctx);

    if(msg) ctx.state.sceneData.msgIdForEdit = msg.message_id;
});

scene.leave(async(ctx) => {
    await ctx.api.reply('Вы вышли.');
})

export default scene;
