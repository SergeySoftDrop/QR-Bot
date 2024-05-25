import Bot from "../bot/Bot.js";

import SetAdminMiddleware from "../middlewares/SetAdmin.js"
import BanMiddleware from "../middlewares/BanMiddleware.js"
import observeMiddleware from "../middlewares/ObserveMiddleware.js";

import reportScene from "../scenes/Report.js";
import readScene from "../scenes/ReadQR.js";
import createScene from "../scenes/CreateQR.js";

import viewReportScene from "../scenes/ViewReports.js";
import settingsScene from "../scenes/Settings.js";

import AdminHelper from "./AdminHelper.js";

class BotHelper {
    static setScenes(bot: Bot) {
        bot.setScene(reportScene, viewReportScene, settingsScene, readScene, createScene);
    }

    static setBotCommands(bot: Bot) {
        /**<<===USER===>> */
        bot.command('start', async(ctx) => {
            await ctx.api.reply(
                `<b>Добро пожаловать!</b>\n\n` +
                `Что умеет наш бот:\n` +
                `📷 Чтение QR-кодов: просто отправьте фото или ссылку на фото с QR-кодом, и бот распознает его содержимое.\n` +
                `🖨 Создание QR-кодов: введите текст, ссылку или другую информацию, и бот создаст для вас QR-код.\n\n` +
                `Чтобы ознакомится с командами напишите: /help`,
                {
                    parse_mode: 'HTML'
                }
            );
        });
        bot.command('help', async(ctx) => {
            await ctx.api.reply(
                `Список доступных команд:\n` +
                `/start - Приветственное сообщение.\n` +
                `/report - Сообщить об ошибке.\n` +
                `/create - Создать QR-код.\n` +
                `/read - Прочитать QR-код.\n\n` +
                `<i>Везде доступна команда /leave для выхода</i>`,
                {
                    parse_mode: 'HTML',
                }
            );
        });
        bot.command('report', async(ctx) => {
            await ctx.sceneWorker.enter('report');
        });
        bot.command('read', async(ctx) => {
            await ctx.sceneWorker.enter('read');
        });
        bot.command('create', async(ctx) => {
            await ctx.sceneWorker.enter('create');
        });

        /**<<===ADMIN===>> */
        bot.command('view_report', async(ctx) => {
            if(AdminHelper.isAdmin(ctx)) await ctx.sceneWorker.enter('viewReports');
        });
        bot.command('settings', async(ctx) => {
            if(AdminHelper.isAdmin(ctx)) await ctx.sceneWorker.enter('settings');
        });
        bot.command('ban', async (ctx, args) => { 
            if (AdminHelper.isAdmin(ctx)) {
                if (args!.length < 3) return await ctx.api.reply('Отправьте ID пользователя и причину после команды /ban');
        
                await AdminHelper.setBan(ctx, args![1], args!.slice(2).join(' '));
            }
        });        
        bot.command('unban', async (ctx, args) => { 
            if (AdminHelper.isAdmin(ctx)) {
                if (args!.length < 2) return await ctx.api.reply('Отправьте бан-ID пользователя /unban');
        
                await AdminHelper.delBan(ctx, args![1]);
            }
        });      
    }

    static setMiddlewares(bot: Bot) {
        bot.use(observeMiddleware, SetAdminMiddleware, BanMiddleware);
    }
}

export default BotHelper