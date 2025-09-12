'use client';

import ScreenRecorder from "../_components/screenRecorder";
import axios from "axios";
import { useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import './globals.css';


const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`
    : 'http://localhost:8080';

export default function Home() {
    const [summaries, setSummaries] = useState<String[]>([]);

    async function getSummary(fileName: string): Promise<void> {
        try {
            const summary: string = (await axios.get(`${BACKEND_URL}/summarize/${fileName}`)).data;
            const processedSummary = (await remark()
                .use(html)
                .process(summary)).toString();
            setSummaries([...summaries, processedSummary]);
        } catch (e) {
            console.error(e);
        }
    }

  return (
    <div>
        <ScreenRecorder onStop={getSummary} />
        {summaries.map((summary: String, i: number) => <div key={`video_${i}`} dangerouslySetInnerHTML={{__html: summary}} />)}
    </div>
  );
}
