
import React, { useRef } from 'react';

interface FileInputProps {
    file: File | null;
    setFile: (file: File | null) => void;
}

const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.55a2.25 2.25 0 010 4.5H15m0-4.5v4.5m0-4.5H4.5m10.5 0H6.75A2.25 2.25 0 004.5 12.25v.5A2.25 2.25 0 006.75 15h9.75M4.5 15H2.25A2.25 2.25 0 010 12.75v-1.5A2.25 2.25 0 012.25 9H4.5m0 6V9" />
    </svg>
);


export const FileInput: React.FC<FileInputProps> = ({ file, setFile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0] || null;
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            setFile(droppedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col h-full">
            <label
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center w-full h-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                {file ? (
                    <div className="text-center">
                        <VideoIcon className="w-12 h-12 mx-auto text-google-green" />
                        <p className="mt-2 text-sm font-medium text-gray-700 break-all">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        <button
                            onClick={handleRemoveFile}
                            className="mt-3 text-xs text-red-600 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">Video (MP4, MOV, etc.)</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    id="video-upload"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
};
