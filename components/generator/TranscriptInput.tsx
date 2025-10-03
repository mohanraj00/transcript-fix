
import React, { useRef, useCallback } from 'react';

interface TranscriptInputProps {
    value: string;
    onChange: (value: string) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const TranscriptInput: React.FC<TranscriptInputProps> = ({ value, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const processFile = (file: File) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                onChange(text);
            };
            reader.readAsText(file);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        processFile(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('text/') || file.name.endsWith('.md'))) {
            processFile(file);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            <label htmlFor="transcript-textarea" className="text-base font-semibold text-gray-800">Transcript</label>
            <div 
                className="relative w-full h-full"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <textarea
                    id="transcript-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste your raw transcript here, or drag a .txt file..."
                    className="w-full h-full min-h-[240px] p-4 pr-12 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-google-blue transition-colors resize-y"
                />
                <button
                    type="button"
                    onClick={handleUploadClick}
                    className="absolute bottom-3 right-3 p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-google-blue focus:outline-none focus:ring-2 focus:ring-google-blue transition-all"
                    aria-label="Upload transcript file"
                >
                    <UploadIcon />
                </button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={handleFileChange}
            />
        </div>
    );
};
