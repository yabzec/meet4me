import React from "react";
import {getDueDate} from "@/app/_utils/timeUtils";

interface ActionProps {
    description: string;
    assign?: string;
    dueDate?: number;
}

const Action: React.FunctionComponent<ActionProps> = ({description, dueDate = 0, assign}) => {
    return (<div className="p-4 rounded-2xl bg-slate-800 h-auto max-w-full">
        <p className="mb-1">{description}</p>
        <span className="font-bold">{assign}{(assign && dueDate) && ' | '}{dueDate != 0 && getDueDate(dueDate)}</span>
    </div>);
}

export default Action;
