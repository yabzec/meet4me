import path from "path";
import fs from "fs";

export const recordingsDir = path.join(process.cwd(), 'recordings');
export const fileType = 'webm';

export function getFilePath(fileName: string): string {
    return path.join(recordingsDir, `${fileName}.${fileType}`);
}

export function deleteFile(fileName: string): void {
    let filePath = getFilePath(fileName);
    fs.rmSync(filePath);
}
