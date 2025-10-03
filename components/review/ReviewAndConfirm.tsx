
import React, { useState, useRef } from 'react';
import { ReviewData } from '../../types';
import { fileToBase64 } from '../../utils/file';

interface ReviewAndConfirmProps {
    reviewData: ReviewData;
    onConfirm: (finalData: ReviewData) => void;
    onCancel: () => void;
}

const ReplaceIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const DeleteIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);
const SparklesIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1.158A3.001 3.001 0 018.5 4a2.999 2.999 0 012.357 1.158V3a1 1 0 112 0v1.158c.751.253 1.411.698 2 1.285V3a1 1 0 112 0v3.5a1 1 0 01-1 1h-3.5a1 1 0 01-1-1V5a.999.999 0 01.158-.535A1.999 1.999 0 0010.5 4a1.999 1.999 0 00-1.357.535A.999.999 0 019 5v1.5a1 1 0 01-1 1H4.5a1 1 0 01-1-1V3a1 1 0 011-1zm1 12a1 1 0 011 1v1.158A3.001 3.001 0 019.5 16a2.999 2.999 0 012.357 1.158V15a1 1 0 112 0v1.158c.751.253 1.411.698 2 1.285V15a1 1 0 112 0v3.5a1 1 0 01-1 1h-3.5a1 1 0 01-1-1v-1.5a.999.999 0 01.158-.535A1.999 1.999 0 0011.5 16a1.999 1.999 0 00-1.357.535A.999.999 0 0110 17v1.5a1 1 0 01-1 1H5.5a1 1 0 01-1-1V15a1 1 0 011-1z" clipRule="evenodd" /></svg>);
const BackIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>);


export const ReviewAndConfirm: React.FC<ReviewAndConfirmProps> = ({ reviewData, onConfirm, onCancel }) => {
    const [editedTranscript, setEditedTranscript] = useState(reviewData.transcript);
    const [titleImage, setTitleImage] = useState<string | null>(reviewData.titleImage);
    const [inlineImages, setInlineImages] = useState<string[]>(reviewData.inlineImages);
    const titleImageInputRef = useRef<HTMLInputElement>(null);
    const inlineImageInputRef = useRef<HTMLInputElement>(null);
    const [inlineImageIndexToReplace, setInlineImageIndexToReplace] = useState<number | null>(null);

    const handleReplaceTitleImage = () => {
        titleImageInputRef.current?.click();
    };
    
    const handleDeleteTitleImage = () => {
        setTitleImage(null);
    };

    const handleTitleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            setTitleImage(base64);
        }
        e.target.value = ''; // Reset for re-upload
    };

    const handleReplaceInlineImage = (index: number) => {
        setInlineImageIndexToReplace(index);
        inlineImageInputRef.current?.click();
    };

    const handleInlineImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && inlineImageIndexToReplace !== null) {
            const base64 = await fileToBase64(file);
            setInlineImages(prev => {
                const newImages = [...prev];
                newImages[inlineImageIndexToReplace] = base64;
                return newImages;
            });
        }
        e.target.value = '';
        setInlineImageIndexToReplace(null);
    };

    const handleDeleteInlineImage = (index: number) => {
        setInlineImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleConfirm = () => {
        onConfirm({
            ...reviewData,
            transcript: editedTranscript,
            titleImage,
            inlineImages,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Review & Confirm</h2>
                    <p className="text-sm text-gray-500 mt-1">Make final edits to the transcript and images before generation.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <button onClick={onCancel} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                        <BackIcon /> Back
                    </button>
                    <button onClick={handleConfirm} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-google-blue rounded-full hover:bg-blue-700 transition-colors">
                        <SparklesIcon /> Generate Document
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Final Transcript</h3>
                    <textarea
                        value={editedTranscript}
                        onChange={(e) => setEditedTranscript(e.target.value)}
                        className="w-full h-96 min-h-[400px] p-3 text-sm text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-google-blue transition-colors"
                    />
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Title Image</h3>
                        {titleImage ? (
                            <div className="relative group aspect-video rounded-lg overflow-hidden border bg-gray-100">
                                <img src={`data:image/jpeg;base64,${titleImage}`} alt="Title Image" className="w-full h-full object-contain" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2">
                                     <button onClick={handleReplaceTitleImage} className="h-8 w-8 rounded-full bg-white/80 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Replace title image">
                                        <ReplaceIcon />
                                    </button>
                                    <button onClick={handleDeleteTitleImage} className="h-8 w-8 rounded-full bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" aria-label="Delete title image">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            </div>
                        ) : <div className="text-center text-sm text-gray-500 p-8 border-2 border-dashed rounded-lg">No title image selected.</div>}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Inline Images</h3>
                        {inlineImages.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {inlineImages.map((img, index) => (
                                    <div key={index} className="relative group aspect-video rounded-lg overflow-hidden border bg-gray-100">
                                        <img src={`data:image/jpeg;base64,${img}`} alt={`Inline ${index + 1}`} className="w-full h-full object-contain" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2">
                                            <button onClick={() => handleReplaceInlineImage(index)} className="h-7 w-7 rounded-full bg-white/80 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" aria-label="Replace image">
                                                <ReplaceIcon />
                                            </button>
                                            <button onClick={() => handleDeleteInlineImage(index)} className="h-7 w-7 rounded-full bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600" aria-label="Delete image">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="text-center text-sm text-gray-500 p-8 border-2 border-dashed rounded-lg">No inline images selected.</div>}
                    </div>
                </div>
            </div>

            <input type="file" ref={titleImageInputRef} onChange={handleTitleImageFileChange} className="hidden" accept="image/*" />
            <input type="file" ref={inlineImageInputRef} onChange={handleInlineImageFileChange} className="hidden" accept="image/*" />
        </div>
    );
};
