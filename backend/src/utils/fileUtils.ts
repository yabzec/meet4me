import path from "path";
import fs from "fs";

export const recordingsDir = path.join(process.cwd(), 'recordings');
export const fileType = 'webm';

export function getFileFolder(fileName: string): string {
    return path.join(recordingsDir, fileName);
}

export function getSummaryPath(fileName: string): string {
    return path.join(getFileFolder(fileName), `${fileName}_summary.json`);
}

export function getFilePath(fileName: string): string {
    return path.join(getFileFolder(fileName), `${fileName}.${fileType}`);
}

export function getTranscriptionFilePath(fileName: string): string {
    return path.join(getFileFolder(fileName), `${fileName}.json`);
}


export function getGFilePath(fileName: string): string {
    return path.join(getFileFolder(fileName), `${fileName}_gfile.json`);
}

export function deleteFile(fileName: string): void {
    let folderPath = getFileFolder(fileName);
    fs.rmSync(folderPath, { recursive: true, force: true });
}
