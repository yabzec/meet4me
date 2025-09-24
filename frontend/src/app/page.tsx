'use client';

import React, {useEffect, useState} from "react";
import './globals.css';
import ScreenRecorder from "@/app/_components/screenRecorder";
import { useRouter } from 'next/navigation'
import {getAvailableFiles} from "@/app/actions/backend";
import Recording from "@/app/_components/recording";

export default function Home() {
    const router = useRouter();
    const [current, setCurrent] = useState<string>();
    const [files, setFiles] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAvailableFiles()
            .then(setFiles)
            .catch(e => {
                console.error(e);
                setError("There was an error loading files");
            });
    }, [])

    function sortFiles(a: string, b: string): number{
        const timestampA = Number(a.split('-')[1]);
        const timestampB = Number(b.split('-')[1]);
        return timestampB - timestampA;
    }

    return (<>
        <div className="mt-10">
            <ScreenRecorder onStop={(fileName: string) => {router.push(`/${fileName}`)}} onError={setError} onFileName={setCurrent}/>
        </div>
        {error && <h3 className="mt-10">{error}</h3>}
        <div className="w-full mt-10">
            <h1>Recordings</h1>
            <ul className="w-full mt-10 flex flex-col align-start justify-start gap-4">
                {current && <li><Recording fileName={current} isRecording={true} /></li>}
                {files.sort(sortFiles).map((file, i) => (
                    <li key={`${file}_${i}`}><Recording fileName={file} /></li>
                ))}
            </ul>
        </div>
    </>);
}
