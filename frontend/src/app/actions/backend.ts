const BACKEND_HTTP_URL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'http://localhost:8080';

export async function getOneTimeToken(fileName: string): Promise<string> {
    WEBSOCKET_API_KEY
}