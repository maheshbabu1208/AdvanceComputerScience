import { Readable } from 'stream';
import fs from 'fs';

export const streamToString = async (stream: Readable): Promise<string> => {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('base64');
};

export const getBase64Image = (filePath: string): string => {
    return fs.readFileSync(filePath, { encoding: 'base64' });
};

export const cleanupFile = (filePath: string): void => {
    fs.unlinkSync(filePath);
}; 