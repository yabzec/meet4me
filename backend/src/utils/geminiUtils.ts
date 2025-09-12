import { GoogleGenAI, File, createUserContent, createPartFromUri } from "@google/genai";
import dotenv from 'dotenv'
import { sleep } from "./timeUtils";
import fs from "fs";
import path from "path";

dotenv.config();

export async function summarize(file: File): Promise<string|undefined> {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});
    const {geminiPrompt, geminiSystemInstructions} = getGeminiSetup();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createUserContent([
                createPartFromUri(file.uri!, file.mimeType!),
                geminiPrompt
            ]),
            config: {
                systemInstruction: geminiSystemInstructions
            }
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

export function getGeminiSetup(): {geminiPrompt: string, geminiSystemInstructions: string} {
    const processCwd = process.cwd();
    const geminiPrompt = fs.readFileSync(path.join(processCwd, "geminiPrompt.txt"), "utf8");
    const geminiSystemInstructions = fs.readFileSync(path.join(processCwd, "geminiSystemInstructions.txt"), "utf8");
    return {geminiPrompt, geminiSystemInstructions};
}
