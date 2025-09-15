import {GoogleGenAI, File, createUserContent, createPartFromUri, Type, File as GFile} from "@google/genai";
import dotenv from 'dotenv'
import { sleep } from "./timeUtils";
import fs from "fs";
import path from "path";
import {Summary, Transcription} from "../types/summary";
import {getFilePath, getTranscriptionFilePath} from "./fileUtils";

dotenv.config();

export async function summarize(fileName: string): Promise<Summary> {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});
    const {geminiPromptTranscription, geminiPromptSummary, geminiSystemInstructions} = getGeminiSetup();
    const filePath = getFilePath(fileName);
    const transcriptionFile = getTranscriptionFilePath(fileName);

    let transcriptionString: string;
    if (fs.existsSync(transcriptionFile)) {
        console.log("\tFound transcription");
        transcriptionString = fs.readFileSync(transcriptionFile, { encoding: "utf8" });
    } else {
        const gFile: GFile = await uploadToGemini(filePath);
        transcriptionString = await transcribe(ai, gFile, geminiPromptTranscription, geminiSystemInstructions);
        fs.writeFileSync(transcriptionFile, transcriptionString, { encoding: "utf8" });
    }

    const transcription: Transcription = JSON.parse(transcriptionString);

    return getSummary(ai, transcription, geminiPromptSummary, geminiSystemInstructions);
}

async function transcribe(ai: GoogleGenAI, file: File, geminiPromptTranscription: string, geminiSystemInstructions: string): Promise<string> {
    console.log("\tBegin transcription");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent([
            createPartFromUri(file.uri!, file.mimeType!),
            geminiPromptTranscription
        ]),
        config: {
            systemInstruction: geminiSystemInstructions,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    transcription: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                timeStamp: { type: Type.NUMBER },
                                speaker: { type: Type.STRING },
                                text: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        },
    });

    const data = response.text;

    if (!data) {
        throw new Error("Gemini transcription: No data")
    }

    console.log("\tTranscription complete");

    return data;
}

async function getSummary(ai: GoogleGenAI, transcription: Transcription, geminiPromptSummary: string, geminiSystemInstructions: string): Promise<Summary> {
    const transcriptionText = transcription.transcription.map(t => `${t.speaker}: ${t.text}`).join('\n');
    console.log("\tBegin summary");
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: geminiPromptSummary.replace("%TRANSCRIPTION%", transcriptionText),
        config: {
            systemInstruction: geminiSystemInstructions,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                    actions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                dueDate: { type: Type.NUMBER },
                                assign: { type: Type.STRING },
                                description: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        },
    });
    console.log("\tSummary complete");

    const data = response.text;
    if (!data) {
        throw new Error("Gemini transcription: No data")
    }

    const summary = JSON.parse(data);
    summary.transcription = transcription.transcription;

    return summary as Summary;
}

async function uploadToGemini(fileName: string): Promise<File> {
    const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});
    console.log(`\tUploading ${fileName}`);
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

    if (!currentFile) {
        throw new Error('Error uploading file to gemini');
    }

    console.log("\tUpload complete");

    return currentFile;
}

export function getGeminiSetup(): {geminiPromptTranscription: string, geminiPromptSummary: string, geminiSystemInstructions: string} {
    const processCwd = process.cwd();
    const geminiPromptTranscription = fs.readFileSync(path.join(processCwd, "geminiPromptTranscription.txt"), "utf8");
    const geminiPromptSummary = fs.readFileSync(path.join(processCwd, "geminiPromptSummary.txt"), "utf8");
    const geminiSystemInstructions = fs.readFileSync(path.join(processCwd, "geminiSystemInstructions.txt"), "utf8");
    return {geminiPromptTranscription, geminiPromptSummary, geminiSystemInstructions};
}
