import { config } from "dotenv";
import Bot from "./bot/Bot.js";
import BotHelper from "./helpers/BotHelper.js";
import MongooseHelper from './helpers/MongooseHelper.js';

config();

const bot = new Bot(process.env.BOT_TOKEN!, {
    // bot: {
    //     webHook: {
    //         port: Number.parseInt(process.env.BOT_PORT!)
    //     }
    // }
});

BotHelper.setScenes(bot);
BotHelper.setBotCommands(bot);
BotHelper.setMiddlewares(bot);

MongooseHelper.connect(process.env.MONGO_URI!);

bot.startPolling();

// await bot.setWebhook(process.env.WEBHOOK_URL!, {
//     certificate: '/etc/nginx/ssl/semaxagency.ru.crt '
// });

console.log('bot has been started');