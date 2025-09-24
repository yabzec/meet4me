import Button, {Size} from "@/app/_components/button";

export function addVideoLinks(text: string, videoFunction: (timing: string) => void): React.ReactNode[] {
    const splittedText: (React.ReactNode | string)[] = text.split(/((?:\d{1,2}:)?\d{1,2}:\d\d)/);
    return splittedText.map<React.ReactNode>((node, i): React.ReactNode => {
        if (typeof node === 'string' && /((?:\d{1,2}:)?\d{1,2}:\d\d)/.test(node)) {
            return <Button key={`${i}_${Math.random()}`} onClick={() => videoFunction(node)} size={Size.XS}>{node}</Button>;
        }

        return node;
    });
}
