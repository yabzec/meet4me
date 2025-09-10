// /client/components/ScreenRecorder.tsx (o dove si trova il tuo componente)
'use client'
import React, { useRef, useState } from 'react';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080';

const ScreenRecorder: React.FunctionComponent = () => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const webSocketRef = useRef<WebSocket | null>(null);

    const startScreenRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                audio: true, video: { frameRate: 30 }
            });

            webSocketRef.current = new WebSocket(WEBSOCKET_URL);

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

    const ButtonStyle = {
        backgroundColor: isRecording ? 'red' : 'green',
        color: 'white',
        fontSize: '2em',
        padding: '10px 20px',
        margin: '5px',
        cursor: 'pointer'
    };

    return (
        <div>
            <button
                style={ButtonStyle}
                onClick={isRecording ? stopScreenRecording : startScreenRecording}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
        </div>
    );
};

export default ScreenRecorder;
