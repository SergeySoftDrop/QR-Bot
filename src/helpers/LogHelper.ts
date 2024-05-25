import fs from 'fs';
import path from 'path';
import zlib from 'zlib'; 
import State from '../TypesAndInterfaces/Session.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogHelper {
    static conf = {
        path: {
            access: path.resolve(__dirname, '../../log/access.log'), 
            error: path.resolve(__dirname, '../../log/error.log')
        },
        maxSize: 1024 * 1024 * 250,
    };

    /**
     * Асинхронно записывает сообщение об ошибке в журнал ошибок.
     * @param {Error} error Объект ошибки.
     * @param {State} ctx
     */
    static async logError(error: Error, ctx: State | null = null): Promise<void> {
        const logText = 
            ctx  
            ? `\nfrom: ${JSON.stringify(ctx.data?.from)}\nmessage: ${error.message}\nname: ${error.name}\ncode: ${(error as any).code}\nlineNumber: ${(error as any).lineNumber}\ncolumnNumber: ${(error as any).columnNumber}\nfileName: ${(error as any).fileName}\nstack: ${error.stack}\n`
            : `\nfrom: Не определено\nmessage: ${error.message}\nname: ${error.name}\ncode: ${(error as any).code}\nlineNumber: ${(error as any).lineNumber}\ncolumnNumber: ${(error as any).columnNumber}\nfileName: ${(error as any).fileName}\nstack: ${error.stack}\n`;
        await this.writeToFile(this.conf.path.error, `${this.getTime()} ${logText}\n`);
        console.error('😮' + logText); 
    }

    /**
     * Асинхронно записывает сообщение об ошибке в журнал ошибок.
     * @param {string} logText Текст сообщения об ошибке.
     */
    static async logErrorCustom(logText: string): Promise<void> {
        await this.writeToFile(this.conf.path.error, `${this.getTime()} ${logText}\n`);
        console.error('😮' + logText); 
    }

    /**
     * Записывает сообщение о доступе в журнал доступа.
     * @param {string} logText Текст сообщения о доступе.
     */
    static async logAccess(logText: string): Promise<void> {
        await this.writeToFile(this.conf.path.access, `${this.getTime()} ${logText}\n`);
    }

    /**
     * 
     * @param {String} pathToFile 
     * @param {String} text 
     */
    private static async writeToFile(pathToFile: string, text: string): Promise<void> {
        this.checkDirPath(pathToFile); // Проверяем и создаем папку, если она не существует
    
        fs.appendFileSync(pathToFile, text); // Записываем текст в файл
    
        fs.stat(pathToFile, async (err, stats) => {
            if(err) return;
            if(stats.size >= this.conf.maxSize) {
                await this.zipFile(pathToFile);
                await this.clearFile(pathToFile);
            }
        });
    }    

    /**
     * 
     * @returns {String}
     */
    private static getTime(): string {
        const date = new Date();
        const year = date.getFullYear().toString().padStart(4, '0'); 
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0'); 
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}.${month}.${day}:${hours}.${minutes}.${seconds}`;
    }

    /**
     * 
     * @param {String} pathToFile 
     */
    private static checkDirPath(pathToFile: string): void {
        if(!fs.existsSync(path.dirname(pathToFile))) fs.mkdirSync(path.dirname(pathToFile), { recursive: true });
    }

    /**
     * Асинхронно сжимает файл с помощью Gzip.
     * @param {string} pathToFile Путь к файлу для сжатия.
     */
    static async zipFile(pathToFile: string): Promise<void> {
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

    /**
     * Асинхронно очищает файл.
     * @param {string} pathToFile Путь к файлу для очистки.
     */
    static async clearFile(pathToFile: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.truncate(pathToFile, 0, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

export default LogHelper;