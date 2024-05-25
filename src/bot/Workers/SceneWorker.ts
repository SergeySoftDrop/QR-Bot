import { ReturnParams } from "../../TypesAndInterfaces/ScceneTypes.js";
import State from "../../TypesAndInterfaces/Session.js";
import Scene from "../Scene/Scene.js";
import MiddlewareWorker from "./MiddlewareWorker.js";
import RequestWorker from "./RequestWorker.js";

class SceneWorker {
    private sceneStorage: Map<string, Scene>;

    constructor(
        private middlewareWorker: MiddlewareWorker,
        private requestWorker: RequestWorker
    ) {
        this.sceneStorage = new Map();
    }

    register(scenes: Scene[]) {
        scenes.forEach(scene => this.sceneStorage.set(scene.name, scene));
    }

    async enter(name: string, state: State) {
        state.state.sceneState.inScene = true;
        state.state.sceneState.sceneInfo = { sceneName: name, sceneStep: 0 }
        
        const enterSceneHandler = this.sceneStorage.get(name)?.handlers.enter;

        if(enterSceneHandler) {
            const res = await enterSceneHandler(state);
            if(res && res == ReturnParams.leave) return;
        }

    }

    next(state: State) {
        state.state.sceneState.sceneInfo!.sceneStep++;
    }

    previous(state: State) {
        state.state.sceneState.sceneInfo!.sceneStep--;
    }

    async leave(state: State) {        
        const scene = this.sceneStorage.get(state.state.sceneState.sceneInfo!.sceneName);

        if(scene?.handlers.leave) await scene?.handlers.leave(state);
        state.state.sceneState.inScene = false;
        delete state.state.sceneState.sceneInfo;      
    }

    selectStep(state: State, step: number) {
        state.state.sceneState.sceneInfo!.sceneStep = step;

        return this.sceneStorage.get(state.state.sceneState.sceneInfo!.sceneName)?.steps[step];
    }

    async handleStep(name: string, step: number, state: State) {
        const scene = this.sceneStorage.get(name);

        const nextStep = async () => {            
            await this.requestWorker.chekHandlers(scene?.handlers!, state.data!, state);

            if(state.state.sceneState.inScene) await scene!.steps[step](state); 
        };
        
        await this.middlewareWorker.handle(state, nextStep, ...scene!.middlewares);
    }
}

export default SceneWorker