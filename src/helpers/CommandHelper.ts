class CommandHelper {
    private static commandList = {
        '/read': 'Прочитать QR-code из изображения', 
        '/create': 'Создать QR-code',
    };

    public static commandToText() {
        let res = '';

        for(const key of Object.keys(this.commandList)) { 
            res += `${key} - ${this.commandList[key]}\n`; 
        }

        return res;
    }
}

export default CommandHelper;
