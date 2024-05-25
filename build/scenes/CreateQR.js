import Scene from "../bot/Scene/Scene.js";
import CommandHelper from "../helpers/CommandHelper.js";
import RequestHelper from "../helpers/RequestHelper.js";
import qoqr from "../qoqrAPI/qoqr.js";
const defaultConf = {
    size: 300,
    bgcolor: '255-255-255',
    color: '0-0-0',
    qzone: '4',
    format: 'png'
};
const invalidData = async (ctx, type) => {
    switch (type) {
        case 'data':
            return await ctx.api.reply('Выберите параметр. \nИли /leave, если передумали');
        case 'param':
            return await ctx.api.reply('Пожалуйста, отправьте валидный параметр. \nИли /leave, если передумали');
    }
};
const isValidRGB = (text) => {
    const params = text.split('-');
    if (params.length < 3)
        return false;
    for (const param of params) {
        const num = Number.parseInt(param);
        if (isNaN(num) || num < 0 || num > 255)
            return false;
    }
    return true;
};
const scene = new Scene('create', async (ctx) => {
    if (!RequestHelper.isCallback(ctx) || !RequestHelper.callbackDataIs(ctx, 'default', 'custom', 'leave'))
        return await invalidData(ctx, 'data');
    if (RequestHelper.callbackDataIs(ctx, 'leave')) {
        await ctx.api.telegram.deleteMessage(ctx.info.chatId, ctx.data.message.message_id);
        return await ctx.sceneWorker.leave();
    }
    if (RequestHelper.callbackDataIs(ctx, 'default')) {
        ctx.state.generate = { ...defaultConf };
        await ctx.api.editMessageText('Отправьте информацию, которую нужно закодировать в виде текста.', {
            chat_id: ctx.info.chatId,
            message_id: ctx.data.message.message_id
        });
        return await ctx.sceneWorker.selectStep(5);
    }
    await ctx.api.editMessageText('Отправьте размер одним целым числом.\nНапример: 300, чтобы получить изображение 300x300\nМинимальное значение 10, максимальное 1000.', {
        chat_id: ctx.info.chatId,
        message_id: ctx.data.message.message_id
    });
    return ctx.sceneWorker.next();
}, async (ctx) => {
    if (!RequestHelper.isText(ctx))
        return await invalidData(ctx, 'param');
    const size = Number.parseInt(ctx.data.text);
    if (isNaN(size) || size < 10 || size > 1000)
        return await invalidData(ctx, 'param');
    ctx.state.generate.size = size;
    await ctx.api.reply('Отправьте цвет фона.\nНапример: 255-255-255, чтобы получить изображение с белым фоном.');
    return ctx.sceneWorker.next();
}, async (ctx) => {
    if (!RequestHelper.isText(ctx) || !isValidRGB(ctx.data.text))
        return await invalidData(ctx, 'param');
    ctx.state.generate.bgcolor = ctx.data.text;
    await ctx.api.reply('Отправьте цвет заполнения.\nНапример: 0-0-0, чтобы получить изображение с чёрным заполнением.');
    return ctx.sceneWorker.next();
}, async (ctx) => {
    if (!RequestHelper.isText(ctx) || !isValidRGB(ctx.data.text))
        return await invalidData(ctx, 'param');
    ctx.state.generate.color = ctx.data.text;
    await ctx.api.reply('Отправьте размер отступа одним целым числом.\nНапример: 4\nМинимальное значение 0, максимальное 100.');
    return ctx.sceneWorker.next();
}, async (ctx) => {
    if (!RequestHelper.isText(ctx))
        return await invalidData(ctx, 'param');
    const qzone = Number.parseInt(ctx.data.text);
    if (isNaN(qzone) || qzone < 0 || qzone > 100)
        return await invalidData(ctx, 'param');
    ctx.state.generate.qzone = qzone;
    await ctx.api.reply('Отправьте информацию, которую нужно закодировать в виде текста.');
    return ctx.sceneWorker.next();
}, async (ctx) => {
    if (!RequestHelper.isText(ctx))
        return await invalidData(ctx, 'param');
    ctx.state.generate.data = ctx.data.text;
    const conf = ctx.state.generate ? { ...ctx.state.generate } : { ...defaultConf };
    await ctx.api.reply(`Проверьте корректность параметров\n\n` +
        `Размер: ${conf.size + 'x' + conf.size}\n` +
        `Цвет фона: ${conf.bgcolor}\n` +
        `Цвет заполнения: ${conf.color}\n` +
        `Отступ: ${conf.qzone}\n` +
        `Информация: ${ctx.state.generate.data}`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Сгенерировать', callback_data: 'generate' }],
                [{ text: 'Заполнить заново', callback_data: 'again' }]
            ]
        },
        disable_web_page_preview: true,
    });
    return ctx.sceneWorker.next();
}, async (ctx) => {
    if (!RequestHelper.isCallback(ctx) || !RequestHelper.callbackDataIs(ctx, 'generate', 'again'))
        return await invalidData(ctx, 'data');
    if (RequestHelper.callbackDataIs(ctx, 'again')) {
        await ctx.api.editMessageText('Выберите действие: ', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Продолжить со стандартными настройками', callback_data: 'default' }],
                    [{ text: 'Настроить генерацию', callback_data: 'custom' }],
                    [{ text: 'Выйти', callback_data: 'leave' }]
                ]
            },
            chat_id: ctx.info.chatId,
            message_id: ctx.data.message.message_id
        });
        return await ctx.sceneWorker.selectStep(0);
    }
    const conf = ctx.state.generate ? { ...ctx.state.generate } : { ...defaultConf };
    await ctx.api.telegram.editMessageText('Ваш QR-код готов:', {
        chat_id: ctx.info.chatId,
        message_id: ctx.data.message.message_id
    });
    await ctx.api.telegram.sendPhoto(ctx.info.chatId, await qoqr.createQRCode(conf.data, conf.size, {
        bgcolor: conf.bgcolor,
        color: conf.color,
        qzone: conf.qzone,
        format: 'png'
    }));
    await ctx.api.reply("Выберите действие: ", {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Сгенерировать ещё раз', callback_data: 'again' }],
                [{ text: 'Выйти', callback_data: 'leave' }]
            ]
        }
    });
    await ctx.sceneWorker.next();
}, async (ctx) => {
    if (!RequestHelper.isCallback(ctx) || !RequestHelper.callbackDataIs(ctx, 'leave', 'again'))
        return await invalidData(ctx, 'data');
    if (RequestHelper.callbackDataIs(ctx, 'leave')) {
        await ctx.api.telegram.deleteMessage(ctx.info.chatId, ctx.data.message.message_id);
        return await ctx.sceneWorker.leave();
    }
    await ctx.api.editMessageText('Выберите действие: ', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Продолжить со стандартными настройками', callback_data: 'default' }],
                [{ text: 'Настроить генерацию', callback_data: 'custom' }],
            ]
        },
        chat_id: ctx.info.chatId,
        message_id: ctx.data.message.message_id
    });
    ctx.sceneWorker.selectStep(0);
});
scene.command('leave', async (ctx) => {
    await ctx.sceneWorker.leave();
});
scene.enter(async (ctx) => {
    await ctx.api.reply('Выберите действие: ', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Продолжить со стандартными настройками', callback_data: 'default' }],
                [{ text: 'Настроить генерацию', callback_data: 'custom' }],
                [{ text: 'Выйти', callback_data: 'leave' }]
            ]
        }
    });
});
scene.leave(async (ctx) => {
    if (ctx.state.generate)
        delete ctx.state.generate;
    await ctx.api.reply(CommandHelper.commandToText());
});
export default scene;
//# sourceMappingURL=CreateQR.js.map