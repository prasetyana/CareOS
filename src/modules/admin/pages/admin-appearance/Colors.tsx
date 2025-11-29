import React from 'react';
import SegmentedControl from '@ui/SegmentedControl';
import { useTheme } from '@core/hooks/useTheme';

type Theme = 'Garnet' | 'Sapphire' | 'Emerald' | 'Amethyst';
const themeOptions: Theme[] = ['Garnet', 'Sapphire', 'Emerald', 'Amethyst'];

const Colors: React.FC = () => {
    const themeContext = useTheme();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Colors</h2>
            <div className="max-w-2xl space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-200">Color Theme</h3>
                    <p className="text-brand-secondary dark:text-gray-400 mt-1 mb-4 text-sm">
                        Change the primary accent color throughout your website instantly.
                    </p>
                    <SegmentedControl
                        id="theme-selector"
                        options={themeOptions}
                        value={themeContext.theme}
                        onChange={(val) => themeContext.setTheme(val as Theme)}
                    />
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-200">Live Preview</h3>
                    <p className="text-brand-secondary dark:text-gray-400 mt-1 mb-4 text-sm">
                        See how your selected color theme looks in action.
                    </p>
                    <div className="mt-2 p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="font-bold text-lg" style={{ color: `rgb(var(--color-brand-primary-rgb))` }}>
                                    Sample Colored Text
                                </p>
                                <p className="text-brand-secondary dark:text-gray-400">
                                    This is secondary text.
                                </p>
                            </div>
                            <button className="bg-brand-primary text-white font-medium px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity">
                                Sample Button
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-200">Color Palette</h3>
                    <p className="text-brand-secondary dark:text-gray-400 mt-1 mb-4 text-sm">
                        Current color scheme applied to your storefront.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-brand-primary shadow-md"></div>
                            <p className="text-xs font-medium text-brand-dark dark:text-gray-200">Primary</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-brand-secondary shadow-md"></div>
                            <p className="text-xs font-medium text-brand-dark dark:text-gray-200">Secondary</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-brand-accent shadow-md"></div>
                            <p className="text-xs font-medium text-brand-dark dark:text-gray-200">Accent</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-20 rounded-lg bg-brand-dark dark:bg-gray-200 shadow-md"></div>
                            <p className="text-xs font-medium text-brand-dark dark:text-gray-200">Dark/Light</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Colors;
