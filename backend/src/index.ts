import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';
import fs from 'fs';
import path from 'path';
import {URL} from 'url';
import {File as GFile} from "@google/genai";
import {getGeminiSetup, summarize, uploadToGemini} from "./utils/geminiUtils";
import {deleteFile, getFilePath, recordingsDir } from "./utils/fileUtils";
import cors from 'cors';
import dotenv from 'dotenv';
import { sleep } from "./utils/timeUtils";

dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let pendingFiles: {[k: string]: boolean} = {};
const pendingFilesJson = path.join(process.cwd(), 'reserved.json');

if (!fs.existsSync(pendingFilesJson)) {
    fs.writeFileSync(pendingFilesJson, JSON.stringify(pendingFiles), {encoding: 'utf8'});
} else {
    pendingFiles = JSON.parse(fs.readFileSync(pendingFilesJson, {encoding: 'utf8'}));
}

function releseName(fileName: string): void {
    delete pendingFiles[fileName];
}

async function waitForPending(fileName: string): Promise<void> {
    while (!pendingFiles[fileName]) {
        await sleep(100);
    }
}

if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir);
}

app.get('/new-recording', (req, res) => {
    const clientApiKey = req.query.apiKey;

    if (!clientApiKey || clientApiKey !== process.env.WEBSOCKET_API_KEY) {
        res.sendStatus(401);
        return;
    }

    let newRecordingTitle = `rec-${Date.now()}`;
    let index = 0;

    while (typeof pendingFiles[newRecordingTitle] === 'boolean') {
        index++;
        newRecordingTitle = `${newRecordingTitle}-${index}`;
    }

    pendingFiles[newRecordingTitle] = false;

    res.send(newRecordingTitle);
});

app.get('/delete/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    let filePath = getFilePath(fileName);

    if (!fs.existsSync(filePath)) {
        res.sendStatus(404);
    }

    deleteFile(fileName);
    releseName(fileName);
});

app.get('/summarize/:fileName', (req, res) => {
    (new Promise<string>(async (resolve, reject) => {
        const fileName = req.params.fileName;
        await waitForPending(fileName);
        let filePath = getFilePath(fileName);

        if (!fs.existsSync(filePath)) {
            res.sendStatus(404);
        }
        try {
            const gFile: GFile | undefined = await uploadToGemini(filePath);

            if (!gFile) {
                reject(new Error('Error uploading file to gemini'));
                return;
            }

            const summary: string | undefined = await summarize(gFile!);

            if (!summary) {
                reject(new Error('Error summarizing video'));
                return;
            }

            deleteFile(fileName);
            releseName(fileName);
            resolve(summary);
        } catch (err) {
            reject(err);
        }
    })).then(summary => {
        res.send(summary);
    })
    .catch(err => {
        res.status(502).send('Error summarizing: ' + err);
    });
});

wss.on('connection', (ws, req) => {
    const requestUrl = new URL(req.url || '', `http://${req.headers.host}`);

    const fileName = requestUrl.searchParams.get('fileName');
    if (!fileName) {
        ws.close(400, "Missing fileName paramter");
        ws.terminate();
        return;
    }

    if (!pendingFiles.hasOwnProperty(fileName)) {
        ws.close(404);
        ws.terminate();
        return;
    }

    const filePath = getFilePath(fileName);
    const fileStream = fs.createWriteStream(filePath);

    fileStream.on('finish', () => {
        pendingFiles[fileName] = true;
    });

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

