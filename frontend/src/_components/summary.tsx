import SummaryType from '@/_types/summary';
import React from "react";

interface SummaryProps {
    data: SummaryType
}

const Summary: React.FunctionComponent<SummaryProps> = ({data}) => {
    return (<>
        <h1>{data.title}</h1>
        <p>{data.summary}</p>
        <div id="keyPoints">
            <h3>Key points</h3>
            <ul>
                {data.keyPoints.map((keyPoint, index) => <li key={index}>{keyPoint}</li>)}
            </ul>
        </div>
        <div id="actions">
            <h3>Actions/To-do</h3>
            <ul>
                {data.actions.map((action, index) => <li key={index}>
                    <p>{action.description}</p>
                    <p>{action.assign}{action.dueDate && ` | ${action.dueDate}`}</p>
                </li>)}
            </ul>
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
    </>);
}

export default Summary;
