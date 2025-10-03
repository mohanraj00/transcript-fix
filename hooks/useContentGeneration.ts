
import { useState, useCallback } from 'react';
import { GeneratedHtmlContent, ReviewData } from '../types';
import { extractFrames } from '../services/mediaService';
import { analyzeVideo, generateContent, mergeTranscripts, organizeScreenshots, fixTranscript } from '../services/geminiService';
import { fileToBase64 } from '../utils/file';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '../constants/messages';


export const useContentGeneration = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES.default);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const analyzeAndPrepare = useCallback(async (
        transcript: string,
        videoFile: File | null,
        screenshots: File[]
    ): Promise<ReviewData | null> => {

        clearError();
        setIsLoading(true);
        setLoadingMessage(LOADING_MESSAGES.default);

        try {
            let finalTranscript = transcript;
            let titleImage: string | null = null;
            let inlineImages: string[] = [];
            let isTranscriptAiProcessed = false;
            const hasUserScreenshots = screenshots.length > 0;

            if (videoFile) {
                setLoadingMessage(LOADING_MESSAGES.analyzingVideo);
                // SINGLE API CALL for video analysis
                const { transcript: videoTranscript, titleTimestamp, inlineTimestamps } = await analyzeVideo(videoFile);

                if (videoTranscript) {
                    isTranscriptAiProcessed = true;
                    if (transcript.trim()) {
                        setLoadingMessage(LOADING_MESSAGES.mergingTranscripts);
                        finalTranscript = await mergeTranscripts(transcript, videoTranscript);
                    } else {
                        finalTranscript = videoTranscript;
                    }
                }

                if (!hasUserScreenshots) {
                    setLoadingMessage(LOADING_MESSAGES.extractingKeyframes);
                    if (titleTimestamp !== undefined && inlineTimestamps) {
                        const allTimestamps = [titleTimestamp, ...inlineTimestamps];
                        if (allTimestamps.length > 0) {
                            const extractedImages = await extractFrames(videoFile, allTimestamps);
                            titleImage = extractedImages.length > 0 ? extractedImages.shift()! : null;
                            inlineImages = extractedImages;
                        }
                    }
                }
            } else if (transcript.trim()) {
                setLoadingMessage(LOADING_MESSAGES.correctingTranscript);
                finalTranscript = await fixTranscript(transcript);
                isTranscriptAiProcessed = true;
            }

            if (hasUserScreenshots) {
                setLoadingMessage(LOADING_MESSAGES.processingScreenshots);
                const userScreenshotsBase64 = await Promise.all(screenshots.map(fileToBase64));
                const orderedScreenshots = await organizeScreenshots(finalTranscript || transcript, userScreenshotsBase64);

                titleImage = orderedScreenshots.length > 0 ? orderedScreenshots.shift()! : null;
                inlineImages = orderedScreenshots;
            }

            if (!finalTranscript.trim() && !isTranscriptAiProcessed) {
                finalTranscript = transcript;
            }

            if (!finalTranscript.trim()) {
                throw new Error(ERROR_MESSAGES.noTranscript);
            }

            setIsLoading(false);
            return { transcript: finalTranscript, titleImage, inlineImages, isTranscriptAiProcessed };

        } catch (err) {
            console.error('Generation failed:', err);
            const errorMessage = (err instanceof Error) ? err.message : ERROR_MESSAGES.default;
            setError(errorMessage);
            setIsLoading(false);
            return null;
        }
    }, [clearError]);

    const generateFinalContent = useCallback(async (
        reviewData: ReviewData
    ): Promise<GeneratedHtmlContent | null> => {
        clearError();
        setIsLoading(true);
        setLoadingMessage(LOADING_MESSAGES.finalizing);

        try {
            const allScreenshots = [];
            if (reviewData.titleImage) {
                allScreenshots.push(reviewData.titleImage);
            }
            allScreenshots.push(...reviewData.inlineImages);

            const shouldFixTranscript = !reviewData.isTranscriptAiProcessed;

            const generatedOutput = await generateContent(reviewData.transcript, allScreenshots, shouldFixTranscript, setLoadingMessage);

            setIsLoading(false);
            return generatedOutput;
        } catch (err) {
            console.error('Generation failed:', err);
            const errorMessage = (err instanceof Error) ? err.message : ERROR_MESSAGES.default;
            setError(errorMessage);
            setIsLoading(false);
            return null;
        }
    }, [clearError]);

    return {
        analyzeAndPrepare,
        generateFinalContent,
        isLoading,
        loadingMessage,
        error,
        clearError
    };
};