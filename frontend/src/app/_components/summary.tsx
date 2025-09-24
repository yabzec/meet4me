import SummaryType from '@/app/_types/summary';
import React from "react";
import Action from "@/app/_components/action";
import {chunkIntoN} from "@/app/_utils/arrayUtils";
import {millisecondsToTime} from "@/app/_utils/timeUtils";
import {addVideoLinks} from "@/app/_utils/videoUtils";
import { ClockIcon } from "@phosphor-icons/react";

interface SummaryProps {
    id: string;
    data: SummaryType;
    videoControl: (timing: string) => void;
}

const Summary: React.FunctionComponent<SummaryProps> = ({id, data, videoControl}) => {
    return (<div id={id}>
        <h1>{data.title}</h1>
        <p>{data.summary}</p>
        {((data.keyPoints?.length ?? 0) > 0) && <div id="keyPoints" className="pt-8">
            <h3 className="pb-4">👉 Key points</h3>
            <ul className="list-disc list-outside pl-7">
                {data.keyPoints.map((keyPoint, index) => <li key={index} className="pb-4">{addVideoLinks(keyPoint, videoControl)}</li>)}
            </ul>
        </div>}
        {((data.actions?.length ?? 0) > 0) && <div id="actions" className="pt-8">
            <h3 className="pb-4">✔️ Actions/To-do</h3>
            <div className="grid grid-cols-3 gap-4 items-start">
                {
                    chunkIntoN(data.actions, 3).map((c, cIndex) => <div key={`actChunk_${cIndex}`} className="grid gap-4">
                        {c.map((action, index) =>
                            <Action key={`act_${index}`} description={action.description} assign={action.assign} dueDate={action.dueDate}/>)}
                    </div>)
                }
            </div>
        </div>}
        <div id="transcription" className="pt-8">
            <h3 className="pb-4">✍️ Transcription</h3>
            <div className="pt-4 pl-20 timeline">
                {data.transcription.map((t, index) => {
                    const time = millisecondsToTime(t.timeStamp);
                    return <div key={index} className="transcription mb-8 pl-10 cursor-pointer" onClick={() => videoControl(time)}>
                        <p>{t.text}</p>
                        <p className="font-bold">{t.speaker}</p>
                        <span><ClockIcon size={20} /><span className='pl-2'>{time}</span></span>
                    </div>
                })}
            </div>
        </div>
    </div>);
}

export default Summary;
