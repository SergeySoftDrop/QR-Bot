import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class LogHelper {
    static async logError(error, ctx = null) {
        const logText = ctx
            ? `\nfrom: ${JSON.stringify(ctx.data?.from)}\nmessage: ${error.message}\nname: ${error.name}\ncode: ${error.code}\nlineNumber: ${error.lineNumber}\ncolumnNumber: ${error.columnNumber}\nfileName: ${error.fileName}\nstack: ${error.stack}\n`
            : `\nfrom: Не определено\nmessage: ${error.message}\nname: ${error.name}\ncode: ${error.code}\nlineNumber: ${error.lineNumber}\ncolumnNumber: ${error.columnNumber}\nfileName: ${error.fileName}\nstack: ${error.stack}\n`;
        await this.writeToFile(this.conf.path.error, `${this.getTime()} ${logText}\n`);
        console.error('😮' + logText);
    }
    static async logErrorCustom(logText) {
        await this.writeToFile(this.conf.path.error, `${this.getTime()} ${logText}\n`);
        console.error('😮' + logText);
    }
    static async logAccess(logText) {
        await this.writeToFile(this.conf.path.access, `${this.getTime()} ${logText}\n`);
    }
    static async writeToFile(pathToFile, text) {
        this.checkDirPath(pathToFile);
        fs.appendFileSync(pathToFile, text);
        fs.stat(pathToFile, async (err, stats) => {
            if (err)
                return;
            if (stats.size >= this.conf.maxSize) {
                await this.zipFile(pathToFile);
                await this.clearFile(pathToFile);
            }
        });
    }
    static getTime() {
        const date = new Date();
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}.${month}.${day}:${hours}.${minutes}.${seconds}`;
    }
    static checkDirPath(pathToFile) {
        if (!fs.existsSync(path.dirname(pathToFile)))
            fs.mkdirSync(path.dirname(pathToFile), { recursive: true });
    }
    static async zipFile(pathToFile) {
        return new Promise((resolve, reject) => {
            const input = fs.createReadStream(pathToFile);
            const output = fs.createWriteStream(`${pathToFile}.gz`);
            const gzip = zlib.createGzip();
            input.pipe(gzip).pipe(output);
            output.on('finish', () => {
                resolve();
            });
            output.on('error', (err) => {
                reject(err);
            });
        });
    }
    static async clearFile(pathToFile) {
        return new Promise((resolve, reject) => {
            fs.truncate(pathToFile, 0, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
LogHelper.conf = {
    path: {
        access: path.resolve(__dirname, '../../log/access.log'),
        error: path.resolve(__dirname, '../../log/error.log')
    },
    maxSize: 1024 * 1024 * 250,
};
export default LogHelper;
//# sourceMappingURL=LogHelper.js.map