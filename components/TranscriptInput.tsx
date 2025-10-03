
import React, { useRef } from 'react';

interface TranscriptInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const TranscriptInput: React.FC<TranscriptInputProps> = ({ value, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                onChange(text);
            };
            reader.readAsText(file);
        }
        // Reset file input value to allow uploading the same file again
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="flex flex-col h-full space-y-2">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste your transcript here..."
                className="w-full flex-grow min-h-[150px] p-4 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-google-blue transition-colors"
            />
            <div className="flex items-center">
                <hr className="flex-grow border-t border-gray-200" />
                <span className="px-2 text-xs text-gray-500 uppercase">Or</span>
                <hr className="flex-grow border-t border-gray-200" />
            </div>
            <button
                type="button"
                onClick={handleUploadClick}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-google-blue bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-google-blue"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Transcript File
            </button>
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
