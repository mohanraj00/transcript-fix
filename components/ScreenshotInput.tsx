
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ScreenshotInputProps {
    screenshots: File[];
    setScreenshots: (files: File[] | ((prev: File[]) => File[])) => void;
}

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);


export const ScreenshotInput: React.FC<ScreenshotInputProps> = ({ screenshots, setScreenshots }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropzoneRef = useRef<HTMLDivElement>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        const newImagePreviews = screenshots.map(file => URL.createObjectURL(file));
        setImagePreviews(newImagePreviews);

        // Cleanup function to revoke the URLs when the component unmounts or screenshots change
        return () => {
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [screenshots]);

    const addFiles = useCallback((newFiles: File[]) => {
        const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            setScreenshots(prev => [...prev, ...imageFiles]);
        }
    }, [setScreenshots]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            addFiles(Array.from(event.target.files));
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        addFiles(Array.from(event.dataTransfer.files));
    };

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            if (!dropzoneRef.current?.contains(document.activeElement)) {
                // To avoid pasting images when e.g. a text area is focused.
                // This is a simple check; more complex logic might be needed for other layouts.
            }

            const items = event.clipboardData?.items;
            if (items) {
                const imageFiles: File[] = [];
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                        const blob = items[i].getAsFile();
                        if (blob) {
                            const extension = blob.type.split('/')[1] || 'png';
                            const newFile = new File([blob], `pasted-image-${Date.now()}.${extension}`, { type: blob.type });
                            imageFiles.push(newFile);
                        }
                    }
                }
                if (imageFiles.length > 0) {
                    addFiles(imageFiles);
                }
            }
        };
        
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [addFiles]);

    const handleRemoveFile = (indexToRemove: number) => {
        setScreenshots(prev => prev.filter((_, index) => index !== indexToRemove));
        // Reset file input value to allow re-uploading the same file if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div ref={dropzoneRef} className="w-full">
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <div className="text-center">
                     <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload,</span> drag & drop, or paste
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, etc.</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((previewUrl, index) => (
                        <div key={`${screenshots[index].name}-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border">
                             <img 
                                src={previewUrl} 
                                alt={`Screenshot preview ${index + 1}`} 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the file input click
                                        handleRemoveFile(index);
                                    }}
                                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
                                    aria-label={`Remove screenshot ${index + 1}`}
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
