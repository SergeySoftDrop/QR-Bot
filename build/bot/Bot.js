import TelegramBot from 'node-telegram-bot-api';
import SessionWorker from './Workers/SessionWorker.js';
import SceneWorker from './Workers/SceneWorker.js';
import MiddlewareWorker from './Workers/MiddlewareWorker.js';
import RequestWorker from './Workers/RequestWorker.js';
class Bot {
    constructor(token, options) {
        if (!options)
            options = {};
        if (!options.sessionWorker)
            options.sessionWorker = { cleaner: true, clearRate: 5 * 60 * 60 * 1000, lifeTime: 5 * 60 * 60 * 1000 };
        this.api = new TelegramBot(token, options.bot);
        this.sessionWorker = new SessionWorker(this.api, options.sessionWorker);
        this.middlewaresWorker = new MiddlewareWorker();
        this.requestWorker = new RequestWorker();
        this.sceneWorker = new SceneWorker(this.middlewaresWorker, this.requestWorker);
        this.handlers = {
            hears: [],
            text: [],
            command: new Map(),
            callback: {
                handlers: new Map(),
            },
            middlewares: [],
        };
        this.init();
    }
    hears(text, handler) {
        this.handlers.hears.push({ text, handler });
    }
    onText(regex, handler) {
        this.handlers.text.push({ regex, handler });
    }
    command(command, handler) {
        this.handlers.command.set(command, handler);
    }
    callback(callbackData, handler) {
        this.handlers.callback.handlers.set(callbackData, handler);
    }
    onMessage(handler) {
        this.handlers.message = handler;
    }
    onCallback(handler) {
        this.handlers.callback.default = handler;
    }
    onPhoto(handler) {
        this.handlers.photo = handler;
    }
    setScene(...scenes) {
        this.sceneWorker.register(scenes);
    }
    use(...handler) {
        this.handlers.middlewares.push(...handler);
    }
    async enterScene(name, userId) {
        const state = this.sessionWorker.getState(userId);
        await this.sceneWorker.enter(name, state);
    }
    init() {
        this.api.on('message', async (msg, metadata) => {
            await this.handle('msg', msg, metadata);
        });
        this.api.on('callback_query', async (query) => {
            await this.handle('cb', query);
        });
    }
    async handle(type, data, metadata) {
        const state = this.chekState(data, data.from.id);
        let nextStep;
        if (state.state.sceneState.inScene)
            nextStep = async () => { await this.sceneWorker.handleStep(state.state.sceneState.sceneInfo?.sceneName, state.state.sceneState.sceneInfo?.sceneStep, state); };
        else
            nextStep = async () => { await this.requestWorker.chekHandlers(this.handlers, data, state); };
        await this.middlewaresWorker.handle(state, nextStep, ...this.handlers.middlewares);
    }
    chekState(msg, userId) {
        const state = this.sessionWorker.getState(userId);
        if (state)
            return this.sessionWorker.updateState(userId, msg);
        else
            return this.sessionWorker.setState(userId, msg, this.sceneWorker);
    }
    async startPolling(options) {
        await this.api.startPolling(options);
    }
    async setWebhook(webhookURL, options) {
        await this.api.setWebHook(webhookURL, options);
        console.log(await this.api.getWebHookInfo());
    }
}
export default Bot;
//# sourceMappingURL=Bot.js.map