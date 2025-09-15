export interface Summary {
    title: string;
    summary: string;
    keyPoints: string[];
    actions: ActionItem[];
    transcription: TranscriptionSegment[];
}

export interface Transcription {
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
