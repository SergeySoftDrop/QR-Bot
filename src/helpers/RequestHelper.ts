import TelegramBot from "node-telegram-bot-api";
import State from "../TypesAndInterfaces/Session.js";

class RequestHelper {
    /**
     * Проверить является ли ответ нажатием каллбэк кнопки.
     */
    static isCallback(ctx: State) {
        if ('data' in ctx.data! && ctx.data.hasOwnProperty('data')) return true;
        return false;
    }

    /**
     * Проверяет есть ли видео в сообщении.
     */
    static callbackDataIs(state: State, ...args: Array<RegExp | string>){         
        for(const arg of args) {
            if(arg instanceof RegExp) {
                if(arg.test(state.data!.data)) return true;
            } else {
                if(state.data!.data === arg) return true;
            }
        }
    
        return false;
    }    

    /**
     * Првоерить является ли ответ текстом.
     */
    static isText(state: State): boolean {
        if('text' in state.data! && state.data.hasOwnProperty('text')) return true;
        return false;
    }

    /**
     * Проверяет есть ли прикреплённые фото к сообщению.
     */
    static hasPhoto(ctx: State): boolean {
        return 'photo' in ctx.data! && Array.isArray(ctx.data.photo) && ctx.data.photo.length > 0;
    }
}

export default RequestHelper