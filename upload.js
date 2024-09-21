import axios from 'axios';
import FormData from 'form-data';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs/promises';
import FileType from 'file-type';

class UploadFile {
    constructor() {
        this.url = 'https://qu.ax/upload.php?output=html';
        this.default = 'qu';
        this.fileCache = new Map(); // Almacena buffers de archivos procesados
    }

    async processFile(file) {
        let buffer, filename, fileSize, ext;

        if (Buffer.isBuffer(file)) {
            buffer = file;
            const fileType = await FileType.fromBuffer(buffer);
            ext = fileType ? fileType.ext : 'bin';
            filename = `${this.default}.${ext}`;
            fileSize = buffer.length;
        } else if (typeof file === 'string') {
            const filePath = file;
            if (this.fileCache.has(filePath)) {
                return this.fileCache.get(filePath);
            }
            buffer = await fs.readFile(filePath);
            ext = path.extname(filePath).slice(1);
            filename = `${this.default}.${ext}`;
            fileSize = buffer.length;
            this.fileCache.set(filePath, { buffer, filename, fileSize });
        } else {
            throw new Error('Invalid file format. Must be a Buffer or a string (path)');
        }

        return { buffer, filename, fileSize };
    }

    async qu(files) {
        const formData = new FormData();

        const processFiles = async (filePathsOrBuffers) => {
            const filePromises = filePathsOrBuffers.map(async (file) => {
                const { buffer, filename, fileSize } = await this.processFile(file);
                formData.append('files[]', buffer, filename);
                return { filename, fileSize };
            });
            return Promise.all(filePromises);
        };

        let details;

        if (Array.isArray(files)) {
            details = await processFiles(files);
        } else if (typeof files === 'string') {
            const stats = await fs.stat(files);
            if (stats.isDirectory()) {
                const items = await fs.readdir(files, { withFileTypes: true });
                const filePaths = items.filter(item => item.isFile()).map(item => path.join(files, item.name));
                details = await processFiles(filePaths);
            } else {
                details = await processFiles([files]);
            }
        } else {
            throw new Error('Invalid files input. Must be a Buffer, an array, or a string (path to file or directory)');
        }

        const response = await axios.post(this.url, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        const $ = cheerio.load(response.data);
        const result = [];
        $('a').each((i, e) => {
            const url = $(e).attr('href');
            result.push({ url, ...details[i] });
        });

        return result;
    }

    async telegra() {
        // Implementación pendiente
    }
}

export default UploadFile;