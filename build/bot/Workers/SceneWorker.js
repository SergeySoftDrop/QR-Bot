import { ReturnParams } from "../../TypesAndInterfaces/ScceneTypes.js";
class SceneWorker {
    constructor(middlewareWorker, requestWorker) {
        this.middlewareWorker = middlewareWorker;
        this.requestWorker = requestWorker;
        this.sceneStorage = new Map();
    }
    register(scenes) {
        scenes.forEach(scene => this.sceneStorage.set(scene.name, scene));
    }
    async enter(name, state) {
        state.state.sceneState.inScene = true;
        state.state.sceneState.sceneInfo = { sceneName: name, sceneStep: 0 };
        const enterSceneHandler = this.sceneStorage.get(name)?.handlers.enter;
        if (enterSceneHandler) {
            const res = await enterSceneHandler(state);
            if (res && res == ReturnParams.leave)
                return;
        }
    }
    next(state) {
        state.state.sceneState.sceneInfo.sceneStep++;
    }
    previous(state) {
        state.state.sceneState.sceneInfo.sceneStep--;
    }
    async leave(state) {
        const scene = this.sceneStorage.get(state.state.sceneState.sceneInfo.sceneName);
        if (scene?.handlers.leave)
            await scene?.handlers.leave(state);
        state.state.sceneState.inScene = false;
        delete state.state.sceneState.sceneInfo;
    }
    selectStep(state, step) {
        state.state.sceneState.sceneInfo.sceneStep = step;
        return this.sceneStorage.get(state.state.sceneState.sceneInfo.sceneName)?.steps[step];
    }
    async handleStep(name, step, state) {
        const scene = this.sceneStorage.get(name);
        const nextStep = async () => {
            await this.requestWorker.chekHandlers(scene?.handlers, state.data, state);
            if (state.state.sceneState.inScene)
                await scene.steps[step](state);
        };
        await this.middlewareWorker.handle(state, nextStep, ...scene.middlewares);
    }
}
export default SceneWorker;
//# sourceMappingURL=SceneWorker.js.map