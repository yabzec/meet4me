'use client'

import React, {use, useEffect, useRef, useState} from "react";
import SummaryType from "@/app/_types/summary";
import {getSummary} from "@/app/actions/backend";
import TurndownService from "turndown";
import {timeToSeconds} from "@/app/_utils/timeUtils";
import Summary from "@/app/_components/summary";
import Button, {Type} from "@/app/_components/button";
import {ArrowClockwiseIcon, ArrowLeftIcon, CheckIcon, FileTextIcon, MarkdownLogoIcon} from "@phosphor-icons/react";

const BACKEND_HTTP_URL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'http://localhost:8080';

const FILE_EXTENSION = 'webm';

export default function Page({params}: { params: Promise<{ recording: string }> }) {
    const {recording} = use(params)
    const [summary, setSummary] = useState<SummaryType>();
    const [accepted, setAccepted] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const videoRef = useRef<HTMLVideoElement>(null);

    async function summarize(fileName: string): Promise<void> {
        const summary = await getSummary(fileName);
        if (summary) {
            console.log(summary);
            setSummary(summary);
        } else {
            setError("Problems during summary");
        }
    }

    async function acceptTranscription(fileName: string): Promise<void> {
        // TODO Delete temporary files
        setAccepted(true);
    }

    useEffect(() => {
        summarize(recording);
    }, [recording]);

    function getDocx(): void {
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

    function videoTo(timing: string) {
        const seconds = timeToSeconds(timing);
        if (videoRef.current) {
            videoRef.current!.currentTime = seconds;
        }
    }

    return (<>
        <div className="w-full mt-10">
            <Button onClick="/" icon={<ArrowLeftIcon size={24}/>}>Go back</Button>
            {!summary && <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
                <h3>{error ? error : 'Loading...'}</h3>
            </div>}
            {summary && <div className="flex items-start mt-10 gap-8">
                <div>
                    <Summary data={summary} videoControl={videoTo} id="summary"/>
                </div>
                <div className="w-1/3 sticky top-20 shrink-0">
                    <video ref={videoRef} className="pb-4" controls
                           src={`${BACKEND_HTTP_URL}/recording/${recording}/${recording}.${FILE_EXTENSION}`}/>
                    <div className="grid grid-cols-2">
                        {!accepted && <><Button onClick={() => summarize(recording)} icon={<ArrowClockwiseIcon size={24}/>} type={Type.Warning}>Retry</Button>
                        <Button onClick={() => acceptTranscription(recording)} icon={<CheckIcon size={24}/>} type={Type.Success}>Accept</Button></>}
                        <Button onClick={getDocx} icon={<FileTextIcon size={24}/>}>Get document</Button>
                        <Button onClick={getMarkdown} icon={<MarkdownLogoIcon size={24}/>}>Markdown</Button>
                    </div>
                </div>
            </div>}
        </div>
    </>);
}
