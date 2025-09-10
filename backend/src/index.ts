import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const recordingsDir = path.join(__dirname, 'recordings');
if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir);
}

wss.on('connection', (ws) => {
    console.log('Client connesso.');

    const fileName = `rec-${Date.now()}.webm`;
    const filePath = path.join(recordingsDir, fileName);
    const fileStream = fs.createWriteStream(filePath);

    ws.on('message', (message) => {
        fileStream.write(message);
    });

    ws.on('close', () => {
        console.log('Client disconnesso. Registrazione salvata:', fileName);
        fileStream.end();
    });

    ws.on('error', (err) => {
        console.error('Errore WebSocket:', err);
        fileStream.end();
    });
});

server.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});
