export default interface SummaryType {
    title: string;
    summary: string;
    keyPoints: string[];
    actions: ActionItem[];
    transcription: TranscriptionSegment[];
}

interface ActionItem {
    dueDate?: number;
    assign?: string;
    description: string;
}

interface TranscriptionSegment {
    timeStamp: number;
    speaker: string;
    text: string;
}
