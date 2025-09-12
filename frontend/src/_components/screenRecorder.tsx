'use client'

import {getFileName} from "@/app/actions/backend";
import React, {useRef, useState} from 'react';

const BACKEND_HTTP_URL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'http://localhost:8080';
const BACKEND_SOCKET_URL = process.env.NODE_ENV === 'production'
    ? `wss://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'ws://localhost:8080';

interface ScreenRecorderProps {
    onStop: (fileName: string) => void;
}

const ScreenRecorder: React.FunctionComponent<ScreenRecorderProps> = ({onStop}) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);

    const startScreenRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true, video: { frameRate: 30 }
            });

            const fileName = await getFileName();
            const params = `?fileName=${fileName}`;
            webSocketRef.current = new WebSocket(`${BACKEND_SOCKET_URL}${params}`);

            webSocketRef.current.onopen = () => {
                const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && webSocketRef.current?.readyState === WebSocket.OPEN) {
                        webSocketRef.current.send(event.data);
                    }
                };

                recorder.onstop = () => {
                    console.log("Registrazione fermata.");
                    stream.getTracks().forEach(track => track.stop());
                    webSocketRef.current?.close();
                    setIsRecording(false);
                    onStop(fileName);
                };

                recorder.start(1000);
                setIsRecording(true);
            };

            webSocketRef.current.onerror = (err) => {
                console.error("Errore WebSocket:", err);
                alert("Impossibile connettersi al server di registrazione.");
            };

        } catch (error) {
            console.error("Errore avvio registrazione:", error);
        }
    };

    const stopScreenRecording = () => {
        mediaRecorderRef.current?.stop();
    };

    return (
        <div>
            <button
                className={`recordingButton ${isRecording ? 'stop' : 'start'}`}
                onClick={isRecording ? stopScreenRecording : startScreenRecording}
            >
                <div className={`recordingIcon ${isRecording ? 'stop' : 'start'}`}><span/></div>
                <span>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </span>
            </button>
        </div>
    );
};

export default ScreenRecorder;
