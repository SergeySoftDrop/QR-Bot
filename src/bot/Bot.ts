import TelegramBot from 'node-telegram-bot-api';
import SessionWorker, { SessionWorkerConf } from './Workers/SessionWorker.js';
import { BotHandlers, Handler } from '../TypesAndInterfaces/BotTypes.js';
import SceneWorker from './Workers/SceneWorker.js';
import Scene from './Scene/Scene.js';
import State from '../TypesAndInterfaces/Session.js';
import Middleware from './Middleware/Middleware.js';
import MiddlewareWorker from './Workers/MiddlewareWorker.js';
import RequestWorker from './Workers/RequestWorker.js';

class Bot {
    private api: TelegramBot;
    private sessionWorker: SessionWorker;
    private middlewaresWorker: MiddlewareWorker;
    private requestWorker: RequestWorker;
    private sceneWorker: SceneWorker;
    private handlers: BotHandlers;

    constructor(
        token: string, 
        options?: {
            bot?: TelegramBot.ConstructorOptions
            sessionWorker?: SessionWorkerConf
        }
    ) {

        if(!options) options = {}
        if(!options.sessionWorker) options.sessionWorker = { cleaner: true, clearRate: 5 * 60 * 60 * 1000, lifeTime: 5 * 60 * 60 * 1000 };
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
    
    hears(text: string, handler: Handler) {
        this.handlers.hears.push({ text, handler })
    }

    onText(regex: RegExp, handler: Handler) {
        this.handlers.text.push({regex, handler});
    }
    
    command(command: string, handler: Handler) {
        this.handlers.command.set(command, handler);
    }
    
    callback(callbackData: string, handler: Handler) {
        this.handlers.callback.handlers.set(callbackData, handler);
    }

    onMessage(handler: Handler) {
        this.handlers.message = handler;
    }

    onCallback(handler: Handler) {
        this.handlers.callback.default = handler;
    }

    onPhoto(handler: Handler) {
        this.handlers.photo = handler;
    }

    setScene(...scenes: Scene[]) {
        this.sceneWorker.register(scenes);
    }

    use(...handler: Middleware[]) {
        this.handlers.middlewares.push(...handler);
    }

    async enterScene(name: string, userId: number) {
        const state = this.sessionWorker.getState(userId);
        await this.sceneWorker.enter(name, state!);
    }
    
    private init() {
        this.api.on('message', async(msg, metadata) => {
            await this.handle('msg', msg, metadata);
        });
        this.api.on('callback_query', async(query) => {
            await this.handle('cb', query);
        });
    }

    private async handle(type: 'cb' | 'msg', data: TelegramBot.CallbackQuery | TelegramBot.Message, metadata?: TelegramBot.Metadata) {        
        const state = this.chekState(data, data.from!.id);        

        let nextStep;
        if(state.state.sceneState.inScene) nextStep = async() =>  { await this.sceneWorker.handleStep(state.state.sceneState.sceneInfo?.sceneName!, state.state.sceneState.sceneInfo?.sceneStep!, state) };
        else nextStep = async() => { await this.requestWorker.chekHandlers(this.handlers, data, state) };

        await this.middlewaresWorker.handle(state, nextStep, ...this.handlers.middlewares);
    }

    private chekState(msg: TelegramBot.Message | TelegramBot.CallbackQuery, userId: number): State
    {
        const state = this.sessionWorker.getState(userId);

        if(state) return this.sessionWorker.updateState(userId, msg);
        else return this.sessionWorker.setState(userId, msg, this.sceneWorker);
    }

    async startPolling(options?: TelegramBot.StartPollingOptions | undefined) {
        await this.api.startPolling(options);
    }

    async setWebhook(webhookURL: string, options?: TelegramBot.SetWebHookOptions)
    {
        await this.api.setWebHook(webhookURL, options);

        console.log(await this.api.getWebHookInfo())
    }
}

export default Bot;
