
export type GeneratedHtmlContent = string;

export interface ReviewData {
    transcript: string;
    titleImage: string | null; // base64 string
    inlineImages: string[]; // array of base64 strings
    isTranscriptAiProcessed: boolean;
}
