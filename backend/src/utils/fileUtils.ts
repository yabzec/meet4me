import path from "path";
import fs from "fs";

export const recordingsDir = path.join(process.cwd(), 'recordings');
export const fileType = 'webm';

export function getFilePath(fileName: string): string {
    return path.join(recordingsDir, fileName, `${fileName}.${fileType}`);
}

export function getTranscriptionFilePath(fileName: string): string {
    return path.join(recordingsDir, fileName, `${fileName}.txt`);
}

export function deleteFile(fileName: string): void {
    let filePath = getFilePath(fileName);
    fs.rmSync(filePath);
}
