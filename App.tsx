
import React, { useReducer, useCallback } from 'react';
import { Header } from './components/common/Header';
import { TranscriptInput } from './components/generator/TranscriptInput';
import { ActionButton } from './components/generator/ActionButton';
import { Loader } from './components/common/Loader';
import { OutputDisplay } from './components/output/OutputDisplay';
import { GeneratedHtmlContent, ReviewData } from './types';
import { useContentGeneration } from './hooks/useContentGeneration';
import { ReviewAndConfirm } from './components/review/ReviewAndConfirm';
import { MediaInput } from './components/generator/MediaInput';

// Define the shape of the application state
interface AppState {
    view: 'input' | 'review' | 'output';
    transcript: string;
    videoFile: File | null;
    screenshots: File[];
    reviewData: ReviewData | null;
    output: GeneratedHtmlContent | null;
}

// Define the actions that can be dispatched to update the state
type Action =
    | { type: 'SET_TRANSCRIPT'; payload: string }
    | { type: 'SET_VIDEO_FILE'; payload: File | null }
    | { type: 'SET_SCREENSHOTS'; payload: File[] | ((prev: File[]) => File[]) }
    | { type: 'START_REVIEW'; payload: ReviewData }
    | { type: 'SET_OUTPUT'; payload: GeneratedHtmlContent | null }
    | { type: 'BACK_TO_INPUT' }
    | { type: 'RESET' };

// The initial state of the application
const initialState: AppState = {
    view: 'input',
    transcript: '',
    videoFile: null,
    screenshots: [],
    reviewData: null,
    output: null,
};

// The reducer function to handle state transitions
const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_TRANSCRIPT':
            return { ...state, transcript: action.payload };
        case 'SET_VIDEO_FILE':
            return { ...state, videoFile: action.payload };
        case 'SET_SCREENSHOTS':
            const newScreenshots = typeof action.payload === 'function'
                ? action.payload(state.screenshots)
                : action.payload;
            return { ...state, screenshots: newScreenshots };
        case 'START_REVIEW':
            return { ...state, view: 'review', reviewData: action.payload };
        case 'SET_OUTPUT':
            return { ...state, view: 'output', output: action.payload };
        case 'BACK_TO_INPUT':
            return { ...state, view: 'input', reviewData: null };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
};


const App: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const {
        analyzeAndPrepare,
        generateFinalContent,
        isLoading,
        loadingMessage,
        error,
        clearError
    } = useContentGeneration();

    const handleReset = useCallback(() => {
        dispatch({ type: 'RESET' });
        clearError();
    }, [clearError]);
    
    const handleBackToInput = useCallback(() => {
        dispatch({ type: 'BACK_TO_INPUT' });
        clearError();
    }, [clearError]);


    const handleAnalyzeClick = useCallback(async () => {
        if (!state.videoFile && !state.transcript.trim()) {
            return;
        }

        const result = await analyzeAndPrepare(state.transcript, state.videoFile, state.screenshots);
        if (result) {
            dispatch({ type: 'START_REVIEW', payload: result });
        }
    }, [analyzeAndPrepare, state.transcript, state.videoFile, state.screenshots]);

    const handleFinalGenerate = useCallback(async (finalReviewData: ReviewData) => {
        const result = await generateFinalContent(finalReviewData);
        if (result) {
            dispatch({ type: 'SET_OUTPUT', payload: result });
        }
    }, [generateFinalContent]);

    const isGenerateDisabled = isLoading || (!state.transcript.trim() && !state.videoFile);

    let content;
    if (isLoading) {
        content = <Loader message={loadingMessage} />;
    } else {
        switch (state.view) {
            case 'review':
                if (state.reviewData) {
                    content = (
                        <ReviewAndConfirm
                            reviewData={state.reviewData}
                            onConfirm={handleFinalGenerate}
                            onCancel={handleBackToInput}
                        />
                    );
                }
                break;
            case 'output':
                if (state.output) {
                    content = (
                        <OutputDisplay
                            output={state.output}
                            fileName={state.videoFile?.name || 'content'}
                            onReset={handleReset}
                        />
                    );
                }
                break;
            case 'input':
            default:
                content = (
                    <>
                        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700">1. Provide Content</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Paste a transcript, upload media files, or do both. A transcript or video is required.
                                </p>
                                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <TranscriptInput
                                        value={state.transcript}
                                        onChange={(payload) => dispatch({ type: 'SET_TRANSCRIPT', payload })}
                                    />
                                    <MediaInput
                                        videoFile={state.videoFile}
                                        setVideoFile={(payload) => dispatch({ type: 'SET_VIDEO_FILE', payload })}
                                        screenshots={state.screenshots}
                                        setScreenshots={(payload) => dispatch({ type: 'SET_SCREENSHOTS', payload })}
                                    />
                                </div>
                            </div>

                            <div className="text-center pt-4">
                                <ActionButton text="Analyze & Prepare" onClick={handleAnalyzeClick} disabled={isGenerateDisabled} />
                            </div>
                        </div>
                        {error && (
                            <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>
                        )}
                    </>
                );
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Header />
            <main className="max-w-4xl mx-auto p-4 md:p-8">
                {content}
            </main>
            <footer className="text-center p-4 text-gray-500 text-sm">
                <p>Powered by Gemini API</p>
            </footer>
        </div>
    );
};

export default App;
