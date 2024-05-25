import { config } from "dotenv";
import Bot from "./bot/Bot.js";
import BotHelper from "./helpers/BotHelper.js";
import MongooseHelper from './helpers/MongooseHelper.js';
config();
const bot = new Bot(process.env.BOT_TOKEN, {});
BotHelper.setScenes(bot);
BotHelper.setBotCommands(bot);
BotHelper.setMiddlewares(bot);
MongooseHelper.connect(process.env.MONGO_URI);
bot.startPolling();
console.log('bot has been started');
//# sourceMappingURL=index.js.map