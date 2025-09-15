'use server'
import axios from "axios";
import {remark} from "remark";
import html from "remark-html";
import Summary from "@/_types/summary";

const BACKEND_HTTP_URL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'http://localhost:8080';

export async function getFileName(): Promise<string> {
    return (await axios.get(`${BACKEND_HTTP_URL}/new-recording?apiKey=${process.env.WEBSOCKET_API_KEY}`)).data
}

export async function getSummary(fileName: string): Promise<Summary | undefined> {
    try {
        return (await axios.get(`${BACKEND_HTTP_URL}/summarize/${fileName}`)).data;
    } catch (e) {
        // TODO
        console.error(e);
    }
}

export async function deleteRecording(fileName: string): Promise<boolean> {
    try {
        await axios.delete(`${BACKEND_HTTP_URL}/${fileName}?apiKey=${process.env.WEBSOCKET_API_KEY}`);
        return true;
    } catch (e) {
        // TODO
        console.error(e);
    }

    return false;
}
