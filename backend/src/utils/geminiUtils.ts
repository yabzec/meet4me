import { GoogleGenAI, File, createUserContent, createPartFromUri } from "@google/genai";
import dotenv from 'dotenv'
import { sleep } from "./timeUtils";

dotenv.config();

export async function summarize(file: File): Promise<string|undefined> {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createUserContent([
                createPartFromUri(file.uri!, file.mimeType!),
                "Riassumi il contenuto del video evidenziandone i punti chiave, trascrivi il parlato e infine fai un elenco puntato con tutti i punti salienti"
            ])
        });

        return response.text;
    } catch (reason) {
        // TODO
        console.error(reason);

    }
}

export async function uploadToGemini(fileName: string): Promise<File|undefined> {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});
    try {
        const file = await ai.files.upload({
            file: fileName,
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
