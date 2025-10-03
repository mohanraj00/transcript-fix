
import React, { useRef, useCallback, useState, useEffect } from 'react';

interface MediaInputProps {
    videoFile: File | null;
    setVideoFile: (file: File | null) => void;
    screenshots: File[];
    setScreenshots: (files: File[] | ((prev: File[]) => File[])) => void;
}

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55a2.25 2.25 0 010 4.5H15m0-4.5v4.5m0-4.5H4.5m10.5 0H6.75A2.25 2.25 0 004.5 12.25v.5A2.25 2.25 0 006.75 15h9.75M4.5 15H2.25A2.25 2.25 0 010 12.75v-1.5A2.25 2.25 0 012.25 9H4.5m0 6V9" />
    </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const MediaInput: React.FC<MediaInputProps> = ({ videoFile, setVideoFile, screenshots, setScreenshots }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviews, setImagePreviews] = useState<{ url: string; name: string }[]>([]);

    useEffect(() => {
        const newImagePreviews = screenshots.map(file => ({
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        setImagePreviews(newImagePreviews);

        return () => {
            newImagePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [screenshots]);

    const processFiles = useCallback((files: File[]) => {
        const imageFiles: File[] = [];
        let videoFound: File | null = null;

        files.forEach(file => {
            if (!file) return;
            if (file.type.startsWith('video/')) {
                if (!videoFound) videoFound = file;
            } else if (file.type.startsWith('image/')) {
                imageFiles.push(file);
            }
        });

        if (videoFound) {
            setVideoFile(videoFound);
        }
        if (imageFiles.length > 0) {
            setScreenshots(prev => [...prev, ...imageFiles]);
        }
    }, [setVideoFile, setScreenshots]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(Array.from(event.target.files));
        }
         if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
    
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        processFiles(Array.from(event.dataTransfer.files));
    };
    
    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                const pastedFiles = Array.from(items)
                    .map(item => item.getAsFile())
                    .filter((file): file is File => file !== null);
                if (pastedFiles.length > 0) {
                     processFiles(pastedFiles);
                }
            }
        };
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [processFiles]);

    const handleRemoveVideo = () => setVideoFile(null);
    const handleRemoveScreenshot = (indexToRemove: number) => {
        setScreenshots(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            <h3 className="text-base font-semibold text-gray-800">Media (Optional)</h3>
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-full space-y-3 p-3 border border-gray-300 rounded-lg bg-gray-50 h-full"
            >
                {videoFile && (
                    <div className="border rounded-lg p-2 bg-white flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <VideoIcon className="w-6 h-6 text-google-green flex-shrink-0" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium text-gray-700 truncate">{videoFile.name}</p>
                                <p className="text-xs text-gray-500">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={handleRemoveVideo} className="text-xs text-red-600 hover:underline flex-shrink-0 ml-2 font-medium" aria-label="Remove video">
                            Remove
                        </button>
                    </div>
                )}

                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 animate-fade-in">
                        {imagePreviews.map((preview, index) => (
                            <div key={`${preview.name}-${index}`} className="relative group aspect-video rounded-md overflow-hidden border">
                                <img src={preview.url} alt={`Screenshot preview ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                    <button
                                        onClick={() => handleRemoveScreenshot(index)}
                                        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                                        aria-label={`Remove screenshot ${index + 1}`}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full py-5 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-100 transition-colors"
                >
                    <UploadIcon className="w-8 h-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-center text-gray-600">
                        <span className="font-semibold">Add Video & Images</span>
                    </p>
                    <p className="text-xs text-gray-500">Drag & drop, click, or paste</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="video/*,image/*"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};
