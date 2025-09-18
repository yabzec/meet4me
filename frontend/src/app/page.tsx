'use client';

import React, {useState} from "react";
import './globals.css';
import ScreenRecorder from "@/_components/screenRecorder";
import {getSummary} from "@/app/actions/backend";
import SummaryType from "@/_types/summary";
import Summary from "@/_components/summary";
import TurndownService from "turndown";

export default function Home() {
    const [summary, setSummary] = useState<SummaryType>();
    const [error, setError] = useState<string>();
    const [fileName, setFileName] = useState<string>();

    async function summarize(fileName: string): Promise<void> {
        setFileName(fileName);
        const summary = await getSummary(fileName);
        if (summary) {
            console.log(summary);
            setSummary(summary);
        } else {
            setError("Problems during summary");
        }
    }

    async function deleteFile(): Promise<void> {
        // if (fileName && await deleteRecording(fileName!)) {
            setFileName(undefined);
        // }

    }

    function getDocx() {
        console.log("Todo");
    }

    async function getMarkdown() {
        const turndownService: TurndownService = new TurndownService();
        const summaryNode = document.getElementById('summary');
        if (!summaryNode) {
            // TODO
            console.error("No summary");
        }
        const markdown = turndownService.turndown(summaryNode!);
        await navigator.clipboard.writeText(markdown);
    }

    return (<>
        <button onClick={() => summarize('rec-1758180638753')}>Do</button>
        <ScreenRecorder onStop={summarize}/>
        {(fileName && !summary) && 'Loading...'}
        {summary && <div>
            <Summary data={summary} id="summary" />
            {fileName && <div className="flex">
                <button onClick={() => summarize(fileName)}>Retry</button>
                <button onClick={deleteFile}>Accept</button>
            </div>}
            {!fileName && <div className="flex">
                <button onClick={getDocx}>Download document</button>
                <button onClick={getMarkdown}>Copy markdown</button>
            </div>}
        </div>}
        {error && <h3>{error}</h3>}
    </>);
}
