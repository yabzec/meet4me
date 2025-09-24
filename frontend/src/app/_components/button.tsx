import React from "react";
import Link from "next/link";

export enum Type {
    Link = "link",
    Primary = "primary",
    Success = "success",
    Warning = "warning",
    Error = "error",
}

export enum Size {
    XS = "button-xs",
    SM = "button-sm",
    MD = "button-md",
    LG = "button-lg",
    XL = "button-xl",
}

interface ButtonProps {
    onClick?: (() => void) | string;
    icon?: React.ReactNode;
    type?: Type;
    size?: Size;
}

const Button: React.FunctionComponent<React.PropsWithChildren<ButtonProps>> = ({children, icon, onClick, type, size = Size.LG}) => {
    const content: React.ReactNode = (<>{icon && icon}<span className={icon ? `pl-2` : ''}>{children}</span></>);
    switch (typeof onClick) {
        case "string":
            return <Link href={onClick} className={`button-${type || 'link'} ${size}`}>{content}</Link>;
        case "undefined":
        case "function":
            return <button onClick={onClick} className={`button-${type || 'primary'} ${size}`}>{content}</button>;
    }
}

export default Button;
