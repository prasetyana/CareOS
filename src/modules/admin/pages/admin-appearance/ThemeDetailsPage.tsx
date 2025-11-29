import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@core/hooks/useTheme';
import { useTenant } from '@core/tenant';
import { themes } from '../../data/themes';
import { ArrowLeft } from 'lucide-react';

const ThemeDetailsPage: React.FC = () => {
    const { themeId } = useParams();
    const navigate = useNavigate();
    const themeContext = useTheme();
    const { tenant } = useTenant();

    const theme = themes.find(t => t.id === themeId);

    if (!theme) {
        return <div>Theme not found</div>;
    }

    const isActive = themeContext.layout === theme.id;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{theme.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Detail tema dan pratinjau
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Large Preview Image */}
                <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-900 relative group">
                    <img
                        src={theme.image}
                        alt={theme.name}
                        className="w-full h-full object-cover object-top"
                    />
                    <button
                        onClick={() => {
                            if (tenant) {
                                window.open(`/?tenant=${tenant.slug}&layout=${theme.id}`, '_blank');
                            }
                        }}
                        className="absolute top-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg text-sm font-medium shadow-sm backdrop-blur-sm transition-all"
                    >
                        Pratinjau Langsung
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex justify-between items-start">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {theme.name}
                                </h3>
                                {isActive && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                {theme.description}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            {!isActive && (
                                <button
                                    onClick={() => themeContext.setLayout(theme.id)}
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm text-center"
                                >
                                    Aktifkan Tema
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeDetailsPage;
