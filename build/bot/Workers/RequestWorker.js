class RequestWorker {
    async chekHandlers(handlers, data, state) {
        if ('text' in data) {
            const messageText = data.text;
            for (const { text, handler } of handlers.hears) {
                if (messageText === text) {
                    await handler(state);
                    return;
                }
            }
            for (const { regex, handler } of handlers.text) {
                if (regex.test(messageText)) {
                    await handler(state);
                    return;
                }
            }
            const args = messageText.split(" ");
            if (handlers.command.has(args[0].slice(1))) {
                await handlers.command.get(args[0].slice(1))(state, args);
                return;
            }
            if (handlers.message) {
                await handlers.message(state);
                return;
            }
        }
        else if ('data' in data) {
            const callbackData = data.data;
            if (handlers.callback.handlers.has(callbackData)) {
                await handlers.callback.handlers.get(callbackData)(state);
                return;
            }
            else if (handlers.callback.default) {
                await handlers.callback.default(state);
                return;
            }
        }
        if ('photo' in data && handlers.photo) {
            await handlers.photo(data);
            return;
        }
    }
}
export default RequestWorker;
//# sourceMappingURL=RequestWorker.js.map