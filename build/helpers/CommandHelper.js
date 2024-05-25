class CommandHelper {
    static commandToText() {
        let res = '';
        for (const key of Object.keys(this.commandList)) {
            res += `${key} - ${this.commandList[key]}\n`;
        }
        return res;
    }
}
CommandHelper.commandList = {
    '/read': 'Прочитать QR-code из изображения',
    '/create': 'Создать QR-code',
};
export default CommandHelper;
//# sourceMappingURL=CommandHelper.js.map