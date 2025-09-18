import SummaryType from '@/_types/summary';
import React from "react";
import Action from "@/_components/action";
import {chunkIntoN} from "@/_utils/arrayUtils";

interface SummaryProps {
    id: string;
    data: SummaryType;
}

const Summary: React.FunctionComponent<SummaryProps> = ({id, data}) => {
    return (<div id={id}>
        <h1>{data.title}</h1>
        <p>{data.summary}</p>
        <div id="keyPoints">
            <h3>Key points</h3>
            <ul className="list-disc list-inside">
                {data.keyPoints.map((keyPoint, index) => <li key={index}>{keyPoint}</li>)}
            </ul>
        </div>
        <div id="actions">
            <h3>Actions/To-do</h3>
            <div className="grid grid-cols-4 gap-4 p-4">
                {
                    chunkIntoN(data.actions, 4).map((c, cIndex) => <div key={`actChunk_${cIndex}`} className="grid gap-4">
                        {c.map((action, index) =>
                            <Action key={`act_${index}`} description={action.description} assign={action.assign} dueDate={action.dueDate}/>)}
                    </div>)
                }
            </div>
        </div>
        <div id="transcription">
            <h3>Transcription</h3>
            <div>
                {data.transcription.map((t, index) => <div key={index}>
                    <p>{t.text}</p>
                    <p>{t.timeStamp}{(t.timeStamp && t.speaker) && ' | '}{t.speaker}</p>
                </div>)}
            </div>
        </div>
    </div>);
}

export default Summary;
