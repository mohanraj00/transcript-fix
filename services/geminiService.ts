
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedHtmlContent } from '../types';
import { fileToBase64 } from "../utils/file";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const htmlSchema = {
    type: Type.OBJECT,
    properties: {
        htmlContent: {
            type: Type.STRING,
            description: 'A single string containing the full HTML document with a <head> containing a <style> tag and a <body> containing the structured content.'
        }
    },
    required: ['htmlContent']
};

/**
 * Merges a user-provided transcript with an AI-generated one for greater accuracy.
 * @param userTranscript The transcript provided by the user.
 * @param videoTranscript The transcript generated from video analysis.
 * @returns A promise that resolves to a single, corrected master transcript.
 */
export const mergeTranscripts = async (userTranscript: string, videoTranscript: string): Promise<string> => {
    const prompt = `You are an expert transcriptionist and copy editor. Your task is to synthesize two different transcripts of the same audio into a single, comprehensive, and perfectly corrected master transcript.

You have two sources: a "User-Provided Transcript" and an "AI-Generated Transcript". Both are valuable and should be given equal weight. Your goal is to create a final version that includes **all details from both sources** without losing any information.

**Instructions:**

1.  **Combine Comprehensively:** Meticulously compare both transcripts sentence by sentence. One transcript might have a phrase the other missed, or capture a name more accurately. Your merged version must integrate the details from both to be as complete as possible.
2.  **Correct and Refine:** As you merge the content, correct all spelling mistakes, grammatical errors, and punctuation issues. The final text must be clear, professional, and easy to read.
3.  **Preserve Original Meaning:** You MUST NOT alter the original meaning of the speech. Your job is to combine and correct, not to editorialize or add new information.
4.  **Final Output:** The result must be a single, clean block of text representing the perfected master transcript. Return only this final text.`;

    const mergeSchema = {
        type: Type.OBJECT,
        properties: {
            mergedTranscript: {
                type: Type.STRING,
                description: 'The final, merged, and corrected transcript.'
            }
        },
        required: ['mergedTranscript']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{text: `${prompt}\n\n--- User-Provided Transcript ---\n${userTranscript}\n\n--- AI-Generated Transcript ---\n${videoTranscript}`}] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: mergeSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed.mergedTranscript;
    } catch (e) {
        console.error("Failed to parse JSON from transcript merge:", jsonText);
        throw new Error("Received invalid JSON from the transcript merging API.");
    }
};

/**
 * Analyzes a video file to extract a transcript and identify keyframe timestamps.
 * @param videoFile The video file to analyze.
 * @returns A promise resolving to an object with the transcript and timestamps for title and inline images.
 */
export const analyzeVideo = async (videoFile: File): Promise<{ transcript: string, titleTimestamp: number, inlineTimestamps: number[] }> => {
    const base64Video = await fileToBase64(videoFile);

    const analysisSchema = {
        type: Type.OBJECT,
        properties: {
            transcript: {
                type: Type.STRING,
                description: 'The full, accurate transcript of all spoken words in the video.'
            },
            titleTimestamp: {
                type: Type.NUMBER,
                description: 'A single floating-point number representing the timestamp in seconds for the single best frame to use as a title/hero image. This frame should be visually stunning and represent the video\'s core topic.'
            },
            inlineTimestamps: {
                type: Type.ARRAY,
                items: {
                    type: Type.NUMBER,
                },
                description: 'An array of up to 9 floating-point numbers, representing timestamps for visually compelling frames to be used as inline illustrations throughout the article. Quality over quantity.'
            }
        },
        required: ['transcript', 'titleTimestamp', 'inlineTimestamps']
    };

    const prompt = `You are a meticulous video analysis expert specializing in educational and presentation content. Your task is to process the provided video file and extract key information. Your primary responsibility is selecting high-quality, relevant, and unique frames.

**ABSOLUTE RULES FOR FRAME SELECTION (NON-NEGOTIABLE):**

1.  **ZERO TOLERANCE FOR BAD FRAMES:** You MUST NOT select timestamps corresponding to:
    *   **Blank Screens:** Black screens, white screens, or solid color backgrounds.
    *   **Transitions:** Fades, wipes, dissolves, or any in-between animation state.
    *   **Motion Blur:** Any frame where the subject or camera is in motion, resulting in a blurry image.
    *   **Low Information:** Empty slides, simple "Thank You" or "Q&A" slides.

2.  **CONTENT AND RELEVANCE ARE PARAMOUNT:** Every selected frame MUST:
    *   Be **critically useful**. It should contain a key diagram, a complex chart, a significant code snippet, or a visually dense slide that is essential to understanding a point in the transcript.
    *   Be **perfectly static and clear**. The image must be sharp and easy to read.
    *   Be **diverse**. The inline images should represent a progression through the video's main topics.
    *   **Uniqueness is mandatory.** Every timestamp you return must be unique. Do not select multiple near-identical frames from the same slide or scene.

**YOUR TASKS:**

1.  **Transcript:** Provide a complete and accurate transcript of all spoken content in the video.

2.  **Title Image Timestamp:**
    *   Identify the timestamp (in seconds) for the **single best title frame**. This must be the main title of the video/presentation.

3.  **Inline Image Timestamps:**
    *   Identify an array of **up to 9 additional timestamps** for frames to be used as inline illustrations.
    *   **Quality over quantity.** It is better to return fewer high-quality, distinct frames than to return 9 poor or repetitive ones. If no other good frames exist, return an empty array.

4.  **Final Review (Self-Correction):** Before outputting the JSON, mentally review your list of timestamps. For each one, ask: "Is this frame static, clear, content-rich, and distinct from all others? Is every timestamp unique?" If the answer is no, you MUST find a replacement or remove it.

Return the result as a single JSON object that strictly adheres to the provided schema.`;

    const videoPart = {
        inlineData: {
            mimeType: videoFile.type,
            data: base64Video,
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, videoPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        },
    });
    
    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);

        // Safeguard: Ensure all returned timestamps are unique to prevent duplicate screenshots.
        const allTimestamps = [parsed.titleTimestamp, ...(parsed.inlineTimestamps || [])];
        const uniqueTimestamps = [...new Set(allTimestamps)];

        // The first unique timestamp is always the title
        const uniqueTitleTimestamp = uniqueTimestamps.shift() || 0; 
        
        return {
            transcript: parsed.transcript,
            titleTimestamp: uniqueTitleTimestamp,
            inlineTimestamps: uniqueTimestamps, // The rest are the unique inline timestamps
        };

    } catch (e) {
        console.error("Failed to parse JSON from video analysis:", jsonText);
        throw new Error("Received invalid JSON from the video analysis API.");
    }
};

/**
 * Corrects spelling, grammar, and punctuation in a raw transcript.
 * @param transcript The raw transcript text.
 * @returns A promise that resolves to the corrected transcript.
 */
export const fixTranscript = async (transcript: string): Promise<string> => {
    const prompt = `You are an expert copy editor. Your sole task is to correct the provided transcript for any spelling mistakes, grammatical errors, and punctuation issues. Ensure the text is clear, professional, and readable, but DO NOT alter the original meaning or add new content. Return only the corrected text.`;

    const correctionSchema = {
        type: Type.OBJECT,
        properties: {
            correctedTranscript: {
                type: Type.STRING,
                description: 'The full transcript with all spelling, grammar, and punctuation corrected.'
            }
        },
        required: ['correctedTranscript']
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{text: `${prompt}\n\nTranscript to correct:\n${transcript}`}] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: correctionSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed.correctedTranscript;
    } catch (e) {
        console.error("Failed to parse JSON from transcript correction:", jsonText);
        throw new Error("Received invalid JSON from the transcript correction API.");
    }
};

/**
 * Dynamically generates the main prompt for HTML generation based on whether screenshots are provided.
 * @param hasScreenshots A boolean indicating if screenshots are available.
 * @returns The complete prompt string.
 */
const getBasePrompt = (hasScreenshots: boolean) => {
    const imageAndContextInstructions = hasScreenshots
        ? `**Primary Goal: Add Context and Format as a Professional Article**
1.  **Add Context from Images:** You have been provided with video screenshots. Analyze them to understand the visual context. Use this information to enrich the text. For example, if the transcript mentions "this chart" but doesn't describe it, and an image shows the chart, add a brief description.`
        : `**Primary Goal: Format as a Professional Article**
1.  **Format the Text:** Focus on creating a well-structured and readable article from the provided transcript. Since no images are provided, the layout should be purely text-based.`;

    const imageStructureInstructions = hasScreenshots
        ? `4.  **Content Structure & Images (CRITICAL):**
    *   The first element in the \`<body>\` should be the main title (\`<h1>\`).
    *   **Title Image:** You have been provided with multiple images in order. The VERY FIRST image is the designated title image. Place this image immediately after the \`<h1>\`. Its \`src\` attribute MUST be the placeholder \`{{IMAGE_0}}\`.
    *   **Inline Images:** The remaining images are for inline use. Place them logically where they are relevant within the text. Their \`src\` attributes MUST be the placeholders \`{{IMAGE_1}}\`, \`{{IMAGE_2}}\`, and so on, in the order they were provided.
    *   **Image Uniqueness:** Each image placeholder, from \`{{IMAGE_0}}\` to the last one provided, MUST be used **exactly one time**. Do not repeat or reuse any \`{{IMAGE_X}}\` placeholder in the document.
    *   **Styling:** Style the title image with \`width: 100%; height: auto; margin: 2rem 0;\`. Style inline images with \`max-width: 100%; height: auto; display: block; margin: 2rem auto;\`.`
        : `4.  **Content Structure:**
    *   The first element in the \`<body>\` should be the main title (\`<h1>\`).
    *   **No images are provided.** You MUST NOT include any \`<img>\` tags or image placeholders (like \`{{IMAGE_X}}\`) in your HTML response.`;


    return `You are an expert web designer and content strategist. Your task is to transform the provided final transcript into a single, beautiful, accurate, and self-contained HTML document. The transcript has already been corrected for errors.

${imageAndContextInstructions}

**Secondary Goal: Format as a Professional, Medium-style Article Page**
Follow these instructions precisely for the HTML structure and styling.

1.  **Overall Layout:**
    *   Create a full HTML document (\`<!DOCTYPE html>\`, etc.).
    *   The main content should be in a single, centered column. Style the \`body\` with \`max-width: 740px; margin: 4rem auto; padding: 0 20px;\`.
    *   Use a light background color (e.g., \`#FFFFFF\`) and a dark color for text (e.g., \`#333333\`).

2.  **Styling (CSS in \`<head>\`):**
    *   All CSS must be inside a single \`<style>\` tag in the \`<head>\`. Do NOT use inline style attributes.

3.  **Typography:**
    *   Use a modern, sans-serif font stack, like \`font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\`.
    *   Set a base font size of \`18px\` for paragraphs (\`<p>\`).
    *   Ensure generous line spacing (\`line-height: 1.7;\`) and paragraph spacing (\`margin-bottom: 1.5rem;\`).
    *   The main title (\`<h1>\`) should be large and bold (e.g., \`font-size: 48px; font-weight: 700;\`).
    *   Section headings (\`<h2>\`) should be smaller but still prominent (e.g., \`font-size: 32px; font-weight: 600;\`).

${imageStructureInstructions}

5.  **Anchor Links (Requirement):**
    *   For every \`<h1>\` and \`<h2>\` heading, you MUST make it a navigable anchor link.
    *   The heading tag must have a URL-friendly \`id\`.
    *   Inside the heading tag, wrap the text with an \`<a>\` tag linking to its own \`id\`. This anchor must have the class \`heading-anchor\`.
    *   **Style for Anchors:** Style \`.heading-anchor\` to have \`color: inherit; text-decoration: none;\`.
    *   **Correct Example:** \`<h2 id="my-section-title"><a href="#my-section-title" class="heading-anchor">My Section Title</a></h2>\`

6.  **Final Output:**
    *   The final output must be a single JSON object containing one key: "htmlContent", which holds the entire HTML string.`;
};

/**
 * Generates a beautiful HTML document from a corrected transcript and screenshots.
 * @param fixedTranscript The clean transcript to be formatted.
 * @param screenshots An array of base64 encoded image strings, correctly ordered.
 * @returns A promise resolving to the final HTML content as a string.
 */
const generateHtmlFromTranscript = async (fixedTranscript: string, screenshots: string[]): Promise<GeneratedHtmlContent> => {
    const basePrompt = getBasePrompt(screenshots.length > 0);
    const parts: any[] = [{ text: `${basePrompt}\n\nTranscript:\n${fixedTranscript}` }];

    screenshots.forEach((base64Image) => {
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            }
        });
    });

    const contents = { parts };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: htmlSchema,
        },
    });

    const jsonText = response.text.trim();
    let parsedJson;
    try {
        parsedJson = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", jsonText);
        throw new Error("Received invalid JSON from the API.");
    }
    
    // Replace image placeholders with actual base64 data URIs
    let finalHtml = parsedJson.htmlContent;
    screenshots.forEach((base64, index) => {
        const dataUri = `data:image/jpeg;base64,${base64}`;
        finalHtml = finalHtml.replace(new RegExp(`{{IMAGE_${index}}}`, 'g'), dataUri);
    });

    return finalHtml;
};

/**
 * Takes a transcript and user-provided screenshots, and asks the AI to determine the optimal order.
 * @param transcript The final transcript.
 * @param screenshots An array of UNORDERED base64 encoded image strings.
 * @returns A promise that resolves to an array of ORDERED base64 image strings, with the title image first.
 */
export const organizeScreenshots = async (transcript: string, screenshots: string[]): Promise<string[]> => {
    if (screenshots.length === 0) {
        return [];
    }

    const prompt = `You are an expert content strategist. You are given a transcript and a set of unordered screenshot images. Your task is to determine the optimal order for these images to appear in an article based on the transcript. One image must be designated as the title image.

**Instructions:**

1.  **Analyze the Transcript:** Read through the entire transcript to understand its structure, topics, and flow.
2.  **Analyze the Images:** Examine each image provided. The images are identified by their index in the input array (e.g., Image 0, Image 1, ...).
3.  **Select the Title Image:** Identify the single best image to be the main "title" or "hero" image for the article. This should be the most visually compelling, representative, or a title slide if available.
4.  **Order the Inline Images:** Arrange the remaining images in the sequence that best aligns with the topics as they appear in the transcript.
5.  **Return the Order:** Your output must be a JSON object containing a single key, "ordered_indices", which is an array of numbers.
    *   The first number in the array MUST be the index of the title image.
    *   The subsequent numbers MUST be the indices of the inline images, in their correct order.
    *   The array must contain exactly one entry for each provided image. For example, if 4 images were provided, the array must contain the numbers 0, 1, 2, and 3 in some order.

**Example:**
If you are given 3 images and decide Image 2 is the best title, followed by Image 0 and then Image 1, your response should be:
\`\`\`json
{
  "ordered_indices": [2, 0, 1]
}
\`\`\`
`;

    const organizeSchema = {
        type: Type.OBJECT,
        properties: {
            ordered_indices: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: 'An array of image indices in the desired order, with the title image index first.'
            }
        },
        required: ['ordered_indices']
    };

    const parts: any[] = [{ text: `${prompt}\n\n--- Transcript ---\n${transcript}` }];

    screenshots.forEach((base64Image) => {
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            }
        });
    });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: 'application/json',
            responseSchema: organizeSchema,
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        const indices = parsed.ordered_indices as number[];

        if (indices.length !== screenshots.length) {
            throw new Error("AI returned an incorrect number of indices for screenshot ordering.");
        }
        // Reorder the original screenshots array based on the returned indices.
        return indices.map(i => screenshots[i]);
    } catch (e) {
        console.error("Failed to parse JSON from screenshot organization:", jsonText, e);
        // Fallback: If ordering fails, just return the original order. It's better than crashing.
        return screenshots;
    }
};

/**
 * Orchestrates the entire process of generating the final HTML document.
 * This includes fixing transcripts, ordering screenshots, and generating the final HTML.
 * @param transcript The raw transcript from user input.
 * @param screenshots An array of user-provided, unordered base64 encoded image strings.
 * @param shouldFixTranscript If true, the transcript will be sent for AI correction before formatting.
 * @param onProgress A callback to update the UI with progress messages.
 * @returns A promise that resolves to the final HTML string.
 */
export const generateContent = async (
    transcript: string,
    screenshots: string[],
    shouldFixTranscript: boolean,
    onProgress?: (message: string) => void
): Promise<GeneratedHtmlContent> => {

    let transcriptToFormat = transcript;

    // Only run the fix step if specified. This is for when the user provides a transcript without a video,
    // or if the video analysis fails to produce a transcript.
    if (shouldFixTranscript) {
        onProgress?.('Correcting transcript...');
        transcriptToFormat = await fixTranscript(transcript);
    }

    onProgress?.('Designing your document layout...');
    const finalHtml = await generateHtmlFromTranscript(transcriptToFormat, screenshots);

    return finalHtml;
};