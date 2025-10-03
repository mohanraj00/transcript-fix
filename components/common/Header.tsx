
import React from 'react';

const LogoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-google-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M7 8h10v8H7z" />
    </svg>
);


export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <LogoIcon />
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Transcript AutoFix Tool
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
