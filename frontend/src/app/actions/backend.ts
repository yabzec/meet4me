'use server'
import axios from "axios";

const BACKEND_HTTP_URL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'http://localhost:8080';

export async function getFileName(): Promise<string> {
    return (await axios.get(`${BACKEND_HTTP_URL}/new-recording?apiKey=${process.env.WEBSOCKET_API_KEY}`)).data
}
