'use client';

import React, {useState} from "react";
import './globals.css';
import ScreenRecorder from "@/_components/screenRecorder";
import {deleteRecording, getSummary} from "@/app/actions/backend";
import SummaryType from "@/_types/summary";
import Summary from "@/_components/summary";

export default function Home() {
    const [summary, setSummary] = useState<SummaryType>();
    const [error, setError] = useState<string>();
    const [fileName, setFileName] = useState<string>();

    async function summarize(fileName: string): Promise<void> {
        setFileName(fileName);
        const summary = await getSummary(fileName);
        if (summary) {
            setSummary(summary);
        } else {
            setError("Problems during summary");
        }
    }

    async function deleteFile(): Promise<void> {
        if (fileName && await deleteRecording(fileName!)) {
            setFileName(undefined);
        }
    }

    return (<>
        <button onClick={() => summarize('rec-1757927134185')}>Do</button>
        <ScreenRecorder onStop={summarize} />
        {(fileName && !summary) && 'Loading...'}
        {summary && <Summary data={summary} />}
        {summary && <div>
            <pre dangerouslySetInnerHTML={{__html: JSON.stringify(summary, null, "\n")}} />
            {fileName && <div className="flex">
                <button onClick={() => summarize(fileName)}>Retry</button>
                <button onClick={deleteFile}>Accept</button>
            </div>}
        </div>}
        {error && <h3>{error}</h3>}
    </>);
}
