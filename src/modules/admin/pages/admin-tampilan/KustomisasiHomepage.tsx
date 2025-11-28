

import React, { useState } from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { useHomepageContent } from '@core/hooks/useHomepageContent';
import { useToast } from '@core/hooks/useToast';
import { Section } from '@core/types/homepage';
import ToggleSwitch from '@ui/ToggleSwitch';
import SkeletonLoader from '@ui/SkeletonLoader';
import { GripVertical, Pencil, Home, Pilcrow } from 'lucide-react';

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

const KustomisasiHomepage: React.FC = () => {
    const { config, loading, updateFullConfig } = useHomepageContent();
    const { addToast } = useToast();
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    // FIX: Use `updateFullConfig` to modify the top-level `enabled` property of a section.
    // `updateSection` is only for modifying the `props` object within a section.
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


    if (loading || !config) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-4">
                <SkeletonLoader className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                {Array.from({ length: 5 }).map((_, i) => <SkeletonLoader key={i} className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />)}
                <SkeletonLoader className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Kustomisasi Homepage</h2>
            <p className="text-brand-secondary dark:text-gray-400 mb-6 text-sm">
                Atur urutan dan visibilitas setiap bagian di halaman utama Anda. Klik dan seret ikon grip untuk mengubah urutan.
            </p>
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
                        to={`/admin/tampilan/edit-header`}
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
                                to={`/admin/tampilan/edit-section/${section.id}`}
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
                        to={`/admin/tampilan/edit-footer`}
                        className="p-2 rounded-full text-brand-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        aria-label="Edit Footer"
                    >
                        <Pencil className="w-5 h-5" />
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default KustomisasiHomepage;
