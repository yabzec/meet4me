'use client'

import {getFileName} from "@/app/actions/backend";
import React, {useEffect, useRef, useState} from 'react';

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
    const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedMicDevice, setSelectedMicDevice] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        const getDevices = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(device => device.kind === 'audioinput');
                setMicDevices(audioInputs);
                if (audioInputs.length > 0) {
                    setSelectedMicDevice(audioInputs[0].deviceId);
                }
            } catch (err) {
                console.error("Errore nel caricare i dispositivi audio:", err);
                setError("Non è stato possibile accedere ai dispositivi audio. Controlla i permessi del browser.");
            }
        };
        getDevices();
    }, []);

    const startScreenRecording = async () => {
        setError(null);

        try {
            if (micDevices.length === 0) {
                setError("Nessun microfono trovato per la registrazione combinata.");
                return;
            }

            const screenStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: { frameRate: 30 }});
            if (screenStream.getAudioTracks().length === 0) {
                screenStream.getVideoTracks().forEach(track => track.stop());
                setError("Audio di sistema non catturato. Assicurati di spuntare la casella 'Condividi audio'.");
                return;
            }

            const micStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: selectedMicDevice } } });

            audioContextRef.current = new AudioContext();
            const audioContext = audioContextRef.current;

            const systemSource = audioContext.createMediaStreamSource(screenStream);
            const micSource = audioContext.createMediaStreamSource(micStream);

            const destination = audioContext.createMediaStreamDestination();

            systemSource.connect(destination);
            micSource.connect(destination);

            const mixedAudioTrack = destination.stream.getAudioTracks()[0];
            const videoTrack = screenStream.getVideoTracks()[0];

            const streamToRecord = new MediaStream([videoTrack, mixedAudioTrack]);

            videoTrack.onended = () => {
                stopScreenRecording();
            };

            const fileName = await getFileName();
            const params = `?fileName=${fileName}`;
            webSocketRef.current = new WebSocket(`${BACKEND_SOCKET_URL}${params}`);

            webSocketRef.current.onopen = () => {
                const recorder = new MediaRecorder(streamToRecord, { mimeType: 'video/webm' });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && webSocketRef.current?.readyState === WebSocket.OPEN) {
                        webSocketRef.current.send(event.data);
                    }
                };

                recorder.onstop = () => {
                    console.log("Registrazione fermata.");
                    streamToRecord.getTracks().forEach(track => track.stop());
                    screenStream.getTracks().forEach(track => track.stop());
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
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
