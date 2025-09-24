import express from 'express';
import http from 'http';
import {WebSocketServer} from 'ws';
import fs from 'fs';
import {URL} from 'url';
import {deleteFromGemini, summarize} from "./utils/geminiUtils";
import {deleteFile, getFileFolder, getFilePath, getSummaryPath, recordingsDir} from "./utils/fileUtils";
import cors from 'cors';
import {sleep} from "./utils/timeUtils";
import dotenv from 'dotenv';
import {Summary} from "./types/summary";

dotenv.config();

const {WEBSOCKET_API_KEY} = process.env;

const app = express();
app.use(cors());
app.use('/recording', express.static(recordingsDir))
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const pendingFiles = fs.readdirSync(recordingsDir)
    .reduce<{ [k: string]: boolean }>((obj, fileName) => {
    obj[fileName] = true;
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

async function deleteRecording(fileName: string): Promise<void> {
    await deleteFromGemini(fileName);
    deleteFile(fileName);
    releseName(fileName);
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

app.get('/list', (req, res) => {
    const clientApiKey = req.query.apiKey;

    if (!clientApiKey || clientApiKey !== WEBSOCKET_API_KEY) {
        res.sendStatus(401);
        return;
    }

    res.send(JSON.stringify(Object.keys(pendingFiles)));
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

    (new Promise<void>(async (resolve, reject) => {
        try {
            await deleteRecording(fileName);
            resolve();
        } catch (err) {
            reject(err);
        }
    })).then(() => res.send('OK'))
        .catch(() => res.sendStatus(502));
});

app.get('/summarize/:fileName', (req, res) => {
    (new Promise<string>(async (resolve, reject) => {
        const fileName = req.params.fileName;
        console.log(`Summarizing ${fileName}`);

        if (process.env.NODE_ENV !== 'production' && fs.existsSync(getSummaryPath(fileName))) {
            console.log('In dev, found summary in file system')
            resolve(fs.readFileSync(getSummaryPath(fileName), { encoding: 'utf8' }));
            return;
        }

        try {
            await waitForPending(fileName);
        } catch (e) {
            reject(e);
            return;
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

            const response = JSON.stringify(summary);
            fs.writeFileSync(getSummaryPath(fileName), response, { encoding: 'utf8' });

            resolve(response);
        } catch (err) {
            reject(err);
        }
    })).then(summary => {
        if (process.env.NODE_ENV !== 'production') {
        }
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

    fs.mkdirSync(getFileFolder(fileName));

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

