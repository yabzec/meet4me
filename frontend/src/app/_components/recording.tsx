import React from "react";
import {RecordIcon, VideoCameraIcon} from "@phosphor-icons/react";
import Button, {Type} from "@/app/_components/button";
import {getTitleDate} from "@/app/_utils/timeUtils";


interface RecordingProps {
    fileName: string;
    isRecording?: boolean;
}

const Recording: React.FunctionComponent<RecordingProps> = ({fileName, isRecording = false}) => {
    const milliseconds = fileName.split("rec-")[1];

    if (!milliseconds) {
        throw new Error("Invalid file name");
    }

    const date = new Date(parseInt(milliseconds));
    let icon = <VideoCameraIcon size={32} />;
    if (isRecording) {
        icon = <RecordIcon size={32} weight="fill" className="icon glow-red" />
    }
    return <Button onClick={!isRecording ? `/${fileName}/` : undefined} icon={icon} type={Type.Primary}>
        {getTitleDate(date)}
    </Button>
}

export default Recording;
