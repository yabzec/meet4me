'use server'
import { GoogleGenAI, File, createUserContent, createPartFromUri } from "@google/genai";

export async function summarize(file: File): Promise<String|undefined> {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: createUserContent([
                createPartFromUri(file.uri!, file.mimeType!),
                "Transcribe the content and then summarize, finally list the key points"
            ])
        });

        return response.text;
    } catch (reason) {
        // TODO
        console.error(reason);

    }
}
