import React from 'react';

// FIX: The `OutputFormat` enum was not found in `../types`.
// Since this component is not currently used in the application, the dependency on `OutputFormat` has been removed
// and string literals are used instead to resolve the compilation error.
interface OptionSelectorProps {
    selectedFormat: string;
    onSelectFormat: (format: string) => void;
}

const options = [
    { id: 'pdf', label: 'PDF Document' },
];

export const OptionSelector: React.FC<OptionSelectorProps> = ({ selectedFormat, onSelectFormat }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {options.map((option) => (
                <div key={option.id}>
                    <input
                        type="radio"
                        id={option.id}
                        name="outputFormat"
                        value={option.id}
                        checked={selectedFormat === option.id}
                        onChange={() => onSelectFormat(option.id)}
                        className="hidden"
                    />
                    <label
                        htmlFor={option.id}
                        className={`block p-4 text-center border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedFormat === option.id
                                ? 'bg-google-blue text-white border-google-blue shadow-md'
                                : 'bg-white hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <span className="font-medium">{option.label}</span>
                    </label>
                </div>
            ))}
        </div>
    );
};
