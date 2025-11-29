import React from 'react';
import { useTheme } from '@core/hooks/useTheme';
import { useTenant } from '@core/tenant';
import { useNavigate } from 'react-router-dom';
import { themes } from '../../data/themes';

const Themes: React.FC = () => {
    const themeContext = useTheme();
    const { tenant } = useTenant();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tema</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Kelola tampilan dan tata letak aplikasi Anda
                </p>
            </div>

            {/* Theme Selection Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            onDoubleClick={() => navigate(`detail/${theme.id}`)}
                            className={`group relative flex flex-col bg-white dark:bg-gray-900 border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${themeContext.layout === theme.id
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                                }`}
                        >
                            {/* Preview Area */}
                            <div className="h-40 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={theme.image}
                                    alt={theme.name}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (tenant) {
                                            window.open(`/?tenant=${tenant.slug}&layout=${theme.id}`, '_blank');
                                        }
                                    }}
                                    className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 hover:bg-white text-gray-900 rounded-lg text-xs font-medium shadow-sm backdrop-blur-sm transition-all z-10"
                                >
                                    Pratinjau Langsung
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                        {theme.name}
                                    </h3>
                                    {themeContext.layout === theme.id && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            Aktif
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-grow">
                                    {theme.description}
                                </p>

                                {/* Actions */}
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`detail/${theme.id}`);
                                        }}
                                        className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Lihat Detail
                                    </button>
                                    {themeContext.layout === theme.id ? (
                                        <button
                                            disabled
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                                        >
                                            Digunakan
                                        </button>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                themeContext.setLayout(theme.id);
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                        >
                                            Aktifkan
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Themes;
