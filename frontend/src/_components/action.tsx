import React, {CSSProperties} from "react";

interface ActionProps {
    description: string;
    assign?: string;
    dueDate?: number;
}

const Action: React.FunctionComponent<ActionProps> = ({description, dueDate = 0, assign}) => {
    const style: CSSProperties = {
        maxWidth: "600px",
        borderRadius: "1rem",
        background: "#1E1E29",
        padding: "1rem",
    }
    return (<div style={style}>
        <p className="mb-1">{description}</p>
        <span className="font-bold">{assign}{dueDate != 0 && ` | ${dueDate}`}</span>
    </div>);
}

export default Action;
