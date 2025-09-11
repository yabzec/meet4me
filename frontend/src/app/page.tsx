'use client';

import ScreenRecorder from "../_components/screenRecorder";
import axios from "axios";
import { useState } from "react";


const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'http://localhost:8080';

export default function Home() {
    const [summaries, setSummaries] = useState<String[]>([]);

    async function getSummary(fileName: string): Promise<void> {
        try {
            const summary: string = (await axios.get(`${BACKEND_URL}/summarize/${fileName}`)).data;
            console.log(summary);
            setSummaries([...summaries, summary]);
        } catch (e) {
            console.error(e);
        }
    }

  return (
    <div>
        <ScreenRecorder onStop={getSummary} />
        {summaries.map((summary: String, i: number) => <div key={`video_${i}`}>
            {summary}
        </div>)}
    </div>
  );
}
