import React, { useState } from 'react';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    multiline?: boolean;
    rows?: number;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
    label,
    error,
    icon,
    rightElement,
    className = '',
    value,
    onFocus,
    onBlur,
    multiline = false,
    rows = 3,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== '' && value !== undefined && value !== null;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(e as any);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(e as any);
    };

    return (
        <div className={`relative ${className}`}>
            <div className={`
                relative flex items-center
                bg-gray-50 dark:bg-gray-900/50 
                border rounded-md transition-all duration-200
                ${error
                    ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20'
                }
            `}>
                <div className={`relative flex-1 ${multiline ? '' : 'h-14'}`}>
                    {multiline ? (
                        <textarea
                            {...(props as any)}
                            value={value}
                            rows={rows}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={`
                                w-full bg-transparent border-none outline-none px-4
                                text-gray-900 dark:text-white text-sm
                                pt-6 pb-0
                                placeholder-transparent
                                peer resize-none
                            `}
                            placeholder=" "
                        />
                    ) : (
                        <input
                            {...(props as any)}
                            value={value}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={`
                                w-full h-full bg-transparent border-none outline-none px-4
                                text-gray-900 dark:text-white text-sm
                                pt-5 pb-0
                                placeholder-transparent
                                peer
                            `}
                            placeholder=" "
                        />
                    )}
                    <label
                        className={`
                            absolute left-4 transition-all duration-200 pointer-events-none
                            flex items-center gap-2
                            ${(isFocused || hasValue || props.type === 'date' || props.type === 'time' || props.type === 'datetime-local')
                                ? 'top-3 -translate-y-1/2 scale-75 origin-[0] text-orange-500 dark:text-orange-400'
                                : `${multiline ? 'top-6' : 'top-1/2'} -translate-y-1/2 scale-100 text-gray-500 dark:text-gray-400`
                            }
                        `}
                    >
                        {icon && (
                            <span className={`transition-colors duration-200 ${(isFocused || hasValue) ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400'}`}>
                                {icon}
                            </span>
                        )}
                        {label}
                    </label>
                </div>

                {rightElement && (
                    <div className={`pr-3 ${multiline ? 'absolute right-0 top-4' : ''}`}>
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
};

export default FloatingLabelInput;
