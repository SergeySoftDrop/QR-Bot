class RequestHelper {
    static isCallback(ctx) {
        if ('data' in ctx.data && ctx.data.hasOwnProperty('data'))
            return true;
        return false;
    }
    static callbackDataIs(state, ...args) {
        for (const arg of args) {
            if (arg instanceof RegExp) {
                if (arg.test(state.data.data))
                    return true;
            }
            else {
                if (state.data.data === arg)
                    return true;
            }
        }
        return false;
    }
    static isText(state) {
        if ('text' in state.data && state.data.hasOwnProperty('text'))
            return true;
        return false;
    }
    static hasPhoto(ctx) {
        return 'photo' in ctx.data && Array.isArray(ctx.data.photo) && ctx.data.photo.length > 0;
    }
}
export default RequestHelper;
//# sourceMappingURL=RequestHelper.js.map