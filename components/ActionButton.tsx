
import React from 'react';

interface ActionButtonProps {
    onClick: () => void;
    disabled: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-google-blue border border-transparent rounded-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-google-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-1.5a.5.5 0 000 1H15v1a2 2 0 01-2 2H7a2 2 0 01-2-2V6h1.5a.5.5 0 000-1H5V4z" />
                <path fillRule="evenodd" d="M5 11.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5z" clipRule="evenodd" />
                <path d="M3 10a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" />
            </svg>
            Generate Content
        </button>
    );
};
