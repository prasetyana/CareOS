
import React from 'react';
import SegmentedControl from '@ui/SegmentedControl';
import { useTheme } from '@core/hooks/useTheme';

type Theme = 'Garnet' | 'Sapphire' | 'Emerald' | 'Amethyst';
const themeOptions: Theme[] = ['Garnet', 'Sapphire', 'Emerald', 'Amethyst'];

const SettingsAppearance: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Appearance</h2>
            <div className="max-w-md space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-brand-dark">Theme Customization</h3>
                    <p className="text-brand-secondary mt-1 mb-4 text-sm">
                        Instantly change the primary accent color across the entire website.
                    </p>
                    <SegmentedControl
                        id="theme-selector"
                        options={themeOptions}
                        value={theme}
                        onChange={(val) => setTheme(val as Theme)}
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-brand-dark">Live Preview</h3>
                    <div className="mt-2 p-6 border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="font-bold text-lg" style={{ color: `rgb(var(--color-brand-primary-rgb))` }}>
                                    The quick brown fox...
                                </p>
                                <p className="text-brand-secondary">
                                    ...jumps over the lazy dog.
                                </p>
                            </div>
                            <button className="bg-brand-primary text-white font-medium px-6 py-2.5 rounded-full">
                                Example Button
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsAppearance;
