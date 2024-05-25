import { request } from 'https';
import * as querystring from 'querystring';
class qoqr {
    static async sendGetRequest(url) {
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
                    }
                    catch (error) {
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
    static async readQRCodeFromURL(fileUrl, outputFormat = 'json') {
        try {
            const fullUrl = `${this.baseReadUrl}?${querystring.stringify({ fileurl: fileUrl, outputformat: outputFormat })}`;
            return await this.sendGetRequest(fullUrl);
        }
        catch (error) {
            throw new Error(`Error reading QR code from URL: ${error.message}`);
        }
    }
    static async createQRCode(data, size = '200x200', options = {}) {
        try {
            const params = {
                data: data,
                size,
                ...options
            };
            const fullUrl = `${this.baseCreateUrl}?${querystring.stringify(params)}`;
            return fullUrl;
        }
        catch (error) {
            throw new Error(`Error creating QR code: ${error.message}`);
        }
    }
}
qoqr.baseReadUrl = 'https://api.qrserver.com/v1/read-qr-code/';
qoqr.baseCreateUrl = 'https://api.qrserver.com/v1/create-qr-code/';
export default qoqr;
//# sourceMappingURL=qoqr.js.map