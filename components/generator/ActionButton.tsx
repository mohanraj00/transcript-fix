
import React from 'react';

interface ActionButtonProps {
    onClick: () => void;
    disabled: boolean;
    text?: string;
}

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1.158A3.001 3.001 0 018.5 4a2.999 2.999 0 012.357 1.158V3a1 1 0 112 0v1.158c.751.253 1.411.698 2 1.285V3a1 1 0 112 0v3.5a1 1 0 01-1 1h-3.5a1 1 0 01-1-1V5a.999.999 0 01.158-.535A1.999 1.999 0 0010.5 4a1.999 1.999 0 00-1.357.535A.999.999 0 019 5v1.5a1 1 0 01-1 1H4.5a1 1 0 01-1-1V3a1 1 0 011-1zm1 12a1 1 0 011 1v1.158A3.001 3.001 0 019.5 16a2.999 2.999 0 012.357 1.158V15a1 1 0 112 0v1.158c.751.253 1.411.698 2 1.285V15a1 1 0 112 0v3.5a1 1 0 01-1 1h-3.5a1 1 0 01-1-1v-1.5a.999.999 0 01.158-.535A1.999 1.999 0 0011.5 16a1.999 1.999 0 00-1.357.535A.999.999 0 0110 17v1.5a1 1 0 01-1 1H5.5a1 1 0 01-1-1V15a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);


export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, text }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-google-blue border border-transparent rounded-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-google-blue disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            <SparklesIcon />
            {text || 'Analyze & Prepare'}
        </button>
    );
};
