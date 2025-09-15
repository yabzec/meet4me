import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';
import fs from 'fs';
import {URL} from 'url';
import {summarize} from "./utils/geminiUtils";
import {deleteFile, getFilePath, recordingsDir} from "./utils/fileUtils";
import cors from 'cors';
import {sleep} from "./utils/timeUtils";
import dotenv from 'dotenv';
import {Summary} from "./types/summary";

dotenv.config();

const {WEBSOCKET_API_KEY} = process.env;

const app = express();
app.use(cors());
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const pendingFiles = fs.readdirSync(recordingsDir)
    .reduce<{ [k: string]: boolean }>((obj, fileName) => {
    obj[fileName.split('.')[0]] = true;
    return obj;
}, {});

function releseName(fileName: string): void {
    delete pendingFiles[fileName];
}

async function waitForPending(fileName: string): Promise<void> {
    if (!pendingFiles.hasOwnProperty(fileName)) {
        throw new Error('Pending file "' + fileName + '" not found');
    }

    while (!pendingFiles[fileName]) {
        await sleep(100);
    }
}

if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir);
}

app.get('/new-recording', (req, res) => {
    const clientApiKey = req.query.apiKey;

    if (!clientApiKey || clientApiKey !== WEBSOCKET_API_KEY) {
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

app.delete('/:fileName', (req, res) => {
    const clientApiKey = req.query.apiKey;

    if (!clientApiKey || clientApiKey !== WEBSOCKET_API_KEY) {
        res.sendStatus(401);
        return;
    }

    const fileName = req.params.fileName;
    let filePath = getFilePath(fileName);

    if (!fs.existsSync(filePath)) {
        res.sendStatus(404);
    }

    deleteFile(fileName);
    releseName(fileName);
    res.send('OK');
});

app.get('/summarize/:fileName', (req, res) => {
    (new Promise<string>(async (resolve, reject) => {
        const fileName = req.params.fileName;
        console.log(`Summarizing ${fileName}`);

        try {
            await waitForPending(fileName);
        } catch (e) {
            reject(e);
            return
        }

        const filePath = getFilePath(fileName);

        if (!fs.existsSync(filePath)) {
            res.sendStatus(404);
        }

        try {
            const summary: Summary = await summarize(fileName);

            if (!summary) {
                reject(new Error('Error summarizing video'));
                return;
            }

            resolve(JSON.stringify(summary));
        } catch (err) {
            reject(err);
        }
    })).then(summary => {
        res.send(summary);
        console.log(`\tEnd summarizing`)
    })
    .catch(err => {
        res.status(502).send('Error summarizing: ' + err);
    });
});

wss.on('connection', (ws, req) => {
    const requestUrl = new URL(req.url || '', `http://${req.headers.host}`);

    const fileName = requestUrl.searchParams.get('fileName');
    if (!fileName) {
        ws.close(400, "Missing fileName parameter");
        ws.terminate();
        return;
    }

    if (!pendingFiles.hasOwnProperty(fileName)) {
        ws.close(404);
        ws.terminate();
        return;
    }

    fs.mkdirSync(fileName);

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

