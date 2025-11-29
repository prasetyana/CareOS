import React, { useEffect, useState } from 'react';
import { useTheme } from '@core/hooks/useTheme';

const ThemePreviewPanel: React.FC = () => {
    const [previewLayout, setPreviewLayout] = useState<string | null>(null);
    const themeContext = useTheme();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const layout = searchParams.get('layout');
        if (layout) {
            setPreviewLayout(layout);
        }
    }, []);

    if (!previewLayout) return null;

    const handleApply = () => {
        // Save the new layout
        themeContext.setLayout(previewLayout);

        // Remove the query param and reload/redirect to clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('layout');
        window.location.href = url.toString();
    };

    const handleCancel = () => {
        // Close the tab if it was opened as a popup/new tab
        if (window.opener) {
            window.close();
        } else {
            // Otherwise just remove the param
            const url = new URL(window.location.href);
            url.searchParams.delete('layout');
            window.location.href = url.toString();
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="pl-4 pr-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Mode Pratinjau
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    Batal
                </button>
                <button
                    onClick={handleApply}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm transition-colors"
                >
                    Terapkan Tema
                </button>
            </div>
        </div>
    );
};

export default ThemePreviewPanel;
