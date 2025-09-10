'use server'
import { GoogleGenAI, File } from "@google/genai";

export async function uploadToGemini(blob: Blob): Promise<File|undefined> {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});
    try {
        const file = await ai.files.upload({
            file: blob,
            config: {
                mimeType: "video/webm",
                displayName: "registrazione-schermo-utente.webm"
            }
        });

        let currentFile = file;



        while (currentFile.state === 'PROCESSING') {
            await sleep(1000);

            currentFile = await ai.files.get({name: currentFile.name!});
        }

        return currentFile;
    } catch (reason) {
        // TODO
        console.error(reason);

    }
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
