class SessionWorker {
    constructor(api, options) {
        this.conf = options;
        this.sessionStorage = new Map();
        this.api = api;
        if (this.conf.cleaner)
            this.startSessionCleaner();
    }
    hasState(userId) {
        return this.sessionStorage.has(userId);
    }
    getState(userId) {
        return this.sessionStorage.get(userId)?.state;
    }
    updateState(userId, data) {
        const currentState = this.sessionStorage.get(userId);
        currentState.state.data = data;
        currentState.lastUpdate = Date.now();
        return currentState.state;
    }
    setState(userId, data, sceneWorker) {
        const session = {
            state: {
                api: {
                    telegram: this.api,
                    reply: (text, options) => {
                        return this.api.sendMessage(userId, text, options);
                    },
                    editMessageText: (text, options) => {
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
                        return sceneWorker.selectStep(session.state, step);
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
    startSessionCleaner() {
        setInterval(async () => {
            console.log('clean');
            for (const key of this.sessionStorage.keys()) {
                const session = this.sessionStorage.get(key);
                if (Date.now() - session.lastUpdate >= this.conf.lifeTime)
                    this.sessionStorage.delete(key);
            }
        }, this.conf.clearRate);
    }
}
export default SessionWorker;
//# sourceMappingURL=SessionWorker.js.map