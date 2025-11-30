import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '@core/hooks/useTheme';
import { useTenant } from '@core/tenant';
import { themes } from '../../data/themes';
import { ArrowLeft, GripVertical, Pencil, Home, Pilcrow } from 'lucide-react';
import { useHomepageContent } from '@core/hooks/useHomepageContent';
import { useToast } from '@core/hooks/useToast';
import { useTenantParam } from '@core/hooks/useTenantParam';
import { Section } from '@core/types/homepage';
import ToggleSwitch from '@ui/ToggleSwitch';
import SkeletonLoader from '@ui/SkeletonLoader';

const sectionTypeToName: Record<string, string> = {
    hero: 'Hero Section',
    about: 'Tentang Kami',
    'featured-menu': 'Menu Unggulan',
    promotion: 'Promosi',
    gallery: 'Galeri',
    testimonials: 'Testimoni',
    location: 'Lokasi & Peta',
    'reservation-cta': 'Ajakan Reservasi',
};

const ThemeDetailsPage: React.FC = () => {
    const { themeId } = useParams();
    const navigate = useNavigate();
    const themeContext = useTheme();
    const { tenant } = useTenant();

    // Homepage Customization Hooks
    const { config, loading, updateFullConfig } = useHomepageContent();
    const { addToast } = useToast();
    const { withTenant } = useTenantParam();
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const handleToggle = async (sectionId: string, enabled: boolean) => {
        if (!config) return;
        try {
            const newSections = config.sections.map(s =>
                s.id === sectionId ? { ...s, enabled } : s
            );
            await updateFullConfig({ ...config, sections: newSections });
            addToast(`Section ${enabled ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
        } catch {
            addToast('Gagal memperbarui section.', 'error');
        }
    };

    const onDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const onDragEnter = (index: number) => {
        if (draggedItemIndex === null || draggedItemIndex === index || !config) return;

        const newSections = [...config.sections];
        const draggedItem = newSections.splice(draggedItemIndex, 1)[0];
        newSections.splice(index, 0, draggedItem);

        // Optimistically update UI
        updateFullConfig({ ...config, sections: newSections });
        setDraggedItemIndex(index);
    };

    const onDragEnd = async () => {
        setDraggedItemIndex(null);
        addToast('Urutan section disimpan.', 'success');
    };

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

            {/* Homepage Customization Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Kustomisasi Homepage</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                    Atur urutan dan visibilitas setiap bagian di halaman utama Anda. Klik dan seret ikon grip untuk mengubah urutan.
                </p>

                {loading || !config ? (
                    <div className="space-y-4">
                        <SkeletonLoader className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                        {Array.from({ length: 5 }).map((_, i) => <SkeletonLoader key={i} className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />)}
                        <SkeletonLoader className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {/* Static Header Item */}
                        <li className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <Home className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium text-brand-dark dark:text-gray-200">
                                    Header
                                </span>
                            </div>
                            <Link
                                to={withTenant(`/admin/tampilan/edit-header`)}
                                className="p-2 rounded-full text-brand-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Edit Header"
                            >
                                <Pencil className="w-5 h-5" />
                            </Link>
                        </li>

                        {/* Draggable Section Items */}
                        {config.sections.map((section: Section, index: number) => (
                            <li
                                key={section.id}
                                draggable
                                onDragStart={() => onDragStart(index)}
                                onDragEnter={() => onDragEnter(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnd={onDragEnd}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${draggedItemIndex === index ? 'bg-blue-50 dark:bg-blue-900/30 shadow-lg scale-105' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <button className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500">
                                        <GripVertical className="w-5 h-5" />
                                    </button>
                                    <span className="font-medium text-brand-dark dark:text-gray-200">
                                        {sectionTypeToName[section.type] || section.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ToggleSwitch
                                        id={`toggle-${section.id}`}
                                        checked={section.enabled}
                                        onChange={(checked) => handleToggle(section.id, checked)}
                                    />
                                    <Link
                                        to={withTenant(`/admin/tampilan/edit-section/${section.id}`)}
                                        className="p-2 rounded-full text-brand-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        aria-label={`Edit ${sectionTypeToName[section.type]}`}
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </Link>
                                </div>
                            </li>
                        ))}

                        {/* Static Footer Item */}
                        <li className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <Pilcrow className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                <span className="font-medium text-brand-dark dark:text-gray-200">
                                    Footer
                                </span>
                            </div>
                            <Link
                                to={withTenant(`/admin/tampilan/edit-footer`)}
                                className="p-2 rounded-full text-brand-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                                aria-label="Edit Footer"
                            >
                                <Pencil className="w-5 h-5" />
                            </Link>
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ThemeDetailsPage;
