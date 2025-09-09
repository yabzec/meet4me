'use client'
import React, { useRef, useState } from 'react';

type ScreenRecorderProps = {
    onStop: (blob: Blob) => void;
}
const ScreenRecorder: React.FunctionComponent<ScreenRecorderProps> = ({onStop}) => {
    const screenRecording = useRef<HTMLVideoElement>(null);

    const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
    const [displayMedia, setDisplayMedia] = useState<MediaStreamTrack | null>(null);
    const startScreenRecording = async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            audio: true, video: true
        });
        const recorder = new MediaRecorder(stream);
        setRecorder(recorder);
        setDisplayMedia(stream.getVideoTracks()[0]);
        const screenRecordingChunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                screenRecordingChunks.push(e.data);
            }
        }
        recorder.onstop = () => {
            const blob = new Blob(screenRecordingChunks,
                { type: 'video/webm' });
            if (displayMedia) displayMedia.stop();
            onStop(blob);
        }
        recorder.start();
    }
    const ButtonStyle = {
        backgroundColor: 'green',
        color: 'white',
        fontSize: '2em',
    };

    return (
        <>
            <button style={ButtonStyle} onClick={() =>
                startScreenRecording()}>
                Start Recording
            </button>
            <button style={ButtonStyle} onClick={() =>
            { recorder && recorder.stop() }}>
                Stop Recording
            </button>
        </>
    );
};
export default ScreenRecorder;
