import TelegramBot from "node-telegram-bot-api"
import SceneWorker from '../bot/Workers/SceneWorker.js';
import { Step } from "./ScceneTypes.js";

export default interface State {
        api: {
            telegram: TelegramBot,
            reply: (text: string, options?: TelegramBot.SendMessageOptions) => Promise<TelegramBot.Message>,
            editMessageText: (text: string, options?: TelegramBot.EditMessageTextOptions) => Promise<TelegramBot.Message | boolean>
        },
        sceneWorker: {
            worker: SceneWorker,
            enter: (name: string) => Promise<void>,
            next: () => void,
            prev: () => void,
            leave: () => Promise<void>,
            selectStep: (step: number) => Step,
        },
        state: {
            sceneState: {
                inScene: boolean,
                sceneInfo?: {
                    sceneName: string,
                    sceneStep: number
                },
            }
        } & Record<string, any>,
        info: {
            userId: number,
            chatId: number
        },
        data?: TelegramBot.Message | TelegramBot.CallbackQuery,
}