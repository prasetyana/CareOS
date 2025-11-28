
import React from 'react';
import SegmentedControl from '@ui/SegmentedControl';
import { useTheme } from '@core/hooks/useTheme';

type Theme = 'Garnet' | 'Sapphire' | 'Emerald' | 'Amethyst';
const themeOptions: Theme[] = ['Garnet', 'Sapphire', 'Emerald', 'Amethyst'];

const TampilanTemaWarna: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Tema & Warna</h2>
            <div className="max-w-md space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-200">Tema</h3>
                    <p className="text-brand-secondary dark:text-gray-400 mt-1 mb-4 text-sm">
                        Ubah warna aksen utama di seluruh situs web secara instan.
                    </p>
                    <SegmentedControl
                        id="theme-selector"
                        options={themeOptions}
                        value={theme}
                        onChange={(val) => setTheme(val as Theme)}
                    />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-brand-dark dark:text-gray-200">Pratinjau Langsung</h3>
                    <div className="mt-2 p-6 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <p className="font-bold text-lg" style={{ color: `rgb(var(--color-brand-primary-rgb))` }}>
                                    Contoh Teks Berwarna
                                </p>
                                <p className="text-brand-secondary dark:text-gray-400">
                                    Ini adalah teks sekunder.
                                </p>
                            </div>
                            <button className="bg-brand-primary text-white font-medium px-6 py-2.5 rounded-full">
                                Tombol Contoh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TampilanTemaWarna;
