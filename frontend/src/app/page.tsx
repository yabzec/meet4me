'use client';

import ScreenRecorder from "../_components/screenRecorder";
import { File } from "@google/genai";
import { useState } from "react";
import { uploadToGemini } from "./actions/upload";
import { summarize } from "./actions/summarize";

export default function Home() {
    const [summaries, setSummaries] = useState<String[]>([]);

    async function uploadFile(blob: Blob): Promise<void> {
        const myFile = await uploadToGemini(blob);
        if (!myFile) {
            return;
        }
        const summary = await summarize(myFile);
        if (summary) {
            addFile(summary);
        }
    }

    function addFile(file: String): void {
        setSummaries([...summaries, file]);
    }

  return (
    <div>
        <ScreenRecorder onStop={uploadFile} />
        {summaries.map((summary: String, i: number) => <div key={`video_${i}`}>
            {summary}
        </div>)}
    </div>
  );
}
