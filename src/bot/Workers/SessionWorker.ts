import TelegramBot from "node-telegram-bot-api";
import State from '../../TypesAndInterfaces/Session.js';
import SceneWorker from "./SceneWorker.js";

export type SessionWorkerConf = { cleaner: boolean, clearRate: number, lifeTime: number };
export type Session = {lastUpdate: number, state: State};

class SessionWorker {
    private api: TelegramBot;
    private sessionStorage: Map<number, Session>;

    private conf: SessionWorkerConf;

    constructor(api: TelegramBot, options: SessionWorkerConf) {
        this.conf = options;
        this.sessionStorage = new Map();
        this.api = api;

        if(this.conf.cleaner) this.startSessionCleaner();
    }

    hasState(userId: number) {
        return this.sessionStorage.has(userId);
    }

    getState(userId: number) {
        return this.sessionStorage.get(userId)?.state;
    }

    updateState(userId: number, data: TelegramBot.Message | TelegramBot.CallbackQuery): State {
        const currentState = this.sessionStorage.get(userId);
        currentState!.state.data = data;
        currentState!.lastUpdate = Date.now();
        return currentState!.state;
    }

    setState(userId: number, data: TelegramBot.Message | TelegramBot.CallbackQuery, sceneWorker: SceneWorker) {
        const session: Session = {
            state: {
                api: {
                    telegram: this.api,
                    reply: (text, options?) => {
                        return this.api.sendMessage(userId, text, options);
                    },
                    editMessageText: (text, options?) => {
                        return this.api.editMessageText(text, options);
                    }
                },
                sceneWorker: {
                    worker: sceneWorker,
                    enter: (name) => {
                        return sceneWorker.enter(name, session.state);
                    },
                    leave() {
                        return sceneWorker.leave(session.state);
                    },
                    next() {
                        return sceneWorker.next(session.state);
                    },
                    prev() {
                        return sceneWorker.previous(session.state);
                    },
                    selectStep(step) {
                        return sceneWorker.selectStep(session.state, step)!;
                    },
                },
                state: {
                    sceneState: {
                        inScene: false
                    }
                },
                info: {
                    userId: userId,
                    chatId: data.chat ? data.chat.id : data.from?.id
                },
                data: data
            },
            lastUpdate: Date.now()
        };

        this.sessionStorage.set(userId, session);

        return session.state;
    }

    private startSessionCleaner() {
        setInterval(async() => {
            console.log('clean');
            
            for(const key of this.sessionStorage.keys()) {
                const session = this.sessionStorage.get(key);

                if(Date.now() - session!.lastUpdate >= this.conf.lifeTime) this.sessionStorage.delete(key); 
            }
        }, this.conf.clearRate);
    }
}

export default SessionWorker;