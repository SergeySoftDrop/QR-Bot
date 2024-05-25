import Scene from "../bot/Scene/Scene.js";
import RequestHelper from "../helpers/RequestHelper.js";
import State from "../TypesAndInterfaces/Session.js";
import qoqr from "../qoqrAPI/qoqr.js";
import CommandHelper from "../helpers/CommandHelper.js";

const invalidData = async(ctx: State, type: 'general' | 'url' | 'url-image') => {
    switch(type) {
        case 'general':
            return await ctx.api.reply('Пожалуйста, отправьте изображение или ссылку на изображение. \nИли /leave, если передумали');
        case 'url':
            return await ctx.api.reply('Пожалуйста, отправьте валидную ссылку на изображение. \nИли /leave, если передумали');
        case 'url-image':
            return await ctx.api.reply('QR code не распознан на изображении. Попробуйте ещё раз. \nИли /leave, чтобы выйти из сцены');
    }
};

const isValidUrl = (str: string) => {
    try {
      return !!new URL(str);
    }
    catch (_) {
      return false;
    }
  };

const scene = new Scene('read', 
    async(ctx) => {        
        if(!RequestHelper.isText(ctx) && !RequestHelper.hasPhoto(ctx)) return await invalidData(ctx, 'general');
        
        const msgIdForEdit = (await ctx.api.reply('Обработка...')).message_id;
        let url;

        if(RequestHelper.isText(ctx)) {
            if(!isValidUrl(ctx.data!.text!)) return await invalidData(ctx, 'url');

            url = ctx.data!.text!;
        } else if(RequestHelper.hasPhoto(ctx)) {
            const photo = ctx.data!.photo![ctx.data!.photo!.length - 1];
            
            const file = await ctx.api.telegram.getFile(photo.file_id);
            url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
        }

        const res = await qoqr.readQRCodeFromURL(url);
        
        if(!res[0].symbol[0].data) return await invalidData(ctx, 'url-image');


        await ctx.api.editMessageText(`Информцаия из QR-кода: ${res[0].symbol[0].data}`, {
            chat_id: ctx.info.chatId,
            message_id: msgIdForEdit,
            disable_web_page_preview: true,
        });

        ctx.state.msgIdForEdit = (await ctx.api.reply("Выберите действие: ", {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Отправить ещё раз', callback_data:'send_agin'}],
                    [{text: 'Выйти', callback_data:'leave'}]
                ]
            }
        })).message_id;

        return await ctx.sceneWorker.next();
    },
    async(ctx) => {
        if(!RequestHelper.isCallback(ctx) || !RequestHelper.callbackDataIs(ctx, 'send_agin', 'leave')) return await invalidData(ctx, 'general');

        if(RequestHelper.callbackDataIs(ctx, 'send_agin')) {
            await ctx.api.editMessageText('Отправьте одно изображение или ссылку на изображение', {
                chat_id: ctx.info.chatId,
                message_id: ctx.state.msgIdForEdit
            });

            delete ctx.state.msgIdForEdit;

            ctx.sceneWorker.selectStep(0);
        } else if(RequestHelper.callbackDataIs(ctx, 'leave')) {
            await ctx.api.telegram.deleteMessage(ctx.info.chatId, ctx.state.msgIdForEdit);
            await ctx.sceneWorker.leave();
        }
    }
);

scene.command('leave', async(ctx) => {
    if(ctx.state.msgIdForEdit) {
        try{
            await ctx.api.telegram.deleteMessage(ctx.info.chatId, ctx.state.msgIdForEdit);
        } catch (_) {}

        delete ctx.state.msgIdForEdit;
    }

    await ctx.sceneWorker.leave();
});

scene.callback('cancel', async(ctx) => {
    await ctx.api.telegram.deleteMessage(ctx.info.chatId, ctx.data!.message.message_id);
    await ctx.sceneWorker.leave();
});

scene.leave(async(ctx) => {
    await ctx.api.reply(CommandHelper.commandToText());
});

scene.enter(async(ctx) => {
    await ctx.api.reply('Отправьте одно изображение или ссылку на изображение\nЛучше отправлять изоброжения, доступ по внешним ссылкам не всегда работает.', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Отмена', callback_data:'cancel'}]
            ]
        }
    });
});

export default scene;
