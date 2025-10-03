
import React, { useRef } from 'react';
import { GeneratedHtmlContent } from '../types';

interface OutputDisplayProps {
    output: GeneratedHtmlContent;
    fileName: string;
    onReset: () => void;
}

const StartOverIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.188l-1.581.892a5.002 5.002 0 00-8.736-1.542V5a1 1 0 01-2 0V3a1 1 0 011-1zm12 15a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.898-2.188l1.581-.892a5.002 5.002 0 008.736 1.542V15a1 1 0 012 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
    </svg>
);


const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.086V3a1 1 0 112 0v8.086l1.293-1.379a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output, fileName, onReset }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleDownloadHtml = () => {
        if (!output) return;

        const blob = new Blob([output], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.split('.')[0] || 'content'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center gap-4">
                <h2 className="text-2xl font-semibold text-gray-800">Your Generated Content</h2>
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={handleDownloadHtml} 
                        className="inline-flex items-center justify-center px-6 py-2 text-base font-medium text-white bg-google-blue rounded-full hover:bg-blue-700 transition-colors"
                    >
                        <DownloadIcon /> Download HTML
                    </button>
                    <button
                        onClick={onReset}
                        className="p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-google-blue transition-colors"
                        aria-label="Start Over"
                    >
                        <StartOverIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
            <div className="w-full h-[70vh] border border-gray-200 rounded-lg shadow-inner bg-gray-50 overflow-hidden">
                <iframe
                    ref={iframeRef}
                    srcDoc={output}
                    title="Content Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-modals allow-same-origin"
                />
            </div>
        </div>
    );
};
