import { request } from 'https';
import { parse as parseUrl } from 'url';
import * as querystring from 'querystring';

interface QRCodeResult {
    type: string;
    symbol: {
        seq: number;
        data: string | null;
        error: string | null;
    }[];
}

class qoqr {
    private static baseReadUrl = 'https://api.qrserver.com/v1/read-qr-code/';
    private static baseCreateUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    
    private static async sendGetRequest(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const req = request(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(data);
                        resolve(parsedData);
                    } catch (error) {
                        reject(new Error(`Invalid JSON response: ${data}`));
                    }
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.end();
        });
    }

    /**
     * Прочитать QR code из ссылки
     * @param fileUrl - Ссылка на изображение, содержащее QR code
     * @param outputFormat - Желаемый выходной формат ("json" или "xml")
     */
    static async readQRCodeFromURL(fileUrl: string, outputFormat: 'json' | 'xml' = 'json'): Promise<QRCodeResult[]> {
        try {
            const fullUrl = `${this.baseReadUrl}?${querystring.stringify({ fileurl: fileUrl, outputformat: outputFormat })}`;
            return await this.sendGetRequest(fullUrl);
        } catch (error) {
            throw new Error(`Error reading QR code from URL: ${error.message}`);
        }
    }

    /**
     * Создать QR code
     * @param data - Данные, которые будут закодированы в QR code
     * @param size - Размер QR кода (например, "100x100")
     * @param options - Дополнительные опции для создания QR кода
     */
    static async createQRCode(data: string, size: string = '200x200', options: { [key: string]: string } = {}): Promise<string> {
        try {
            const params = {
                data: data,
                size,
                ...options
            };
            const fullUrl = `${this.baseCreateUrl}?${querystring.stringify(params)}`;
            return fullUrl;
        } catch (error) {
            throw new Error(`Error creating QR code: ${error.message}`);
        }
    }
}

export default qoqr;