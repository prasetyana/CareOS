

import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { useParams, Link, useNavigate } from "react-router-dom";
import { useHomepageContent } from '@core/hooks/useHomepageContent';
import { useToast } from '@core/hooks/useToast';
import SkeletonLoader from '@ui/SkeletonLoader';
import { ArrowLeft } from 'lucide-react';

// Import Form Components
import HeroSectionForm from '@modules/admin/components/editor-forms/HeroSectionForm';
import AboutSectionForm from '@modules/admin/components/editor-forms/AboutSectionForm';
import FeaturedMenuSectionForm from '@modules/admin/components/editor-forms/FeaturedMenuSectionForm';
import PromotionSectionForm from '@modules/admin/components/editor-forms/PromotionSectionForm';
import GallerySectionForm from '@modules/admin/components/editor-forms/GallerySectionForm';
import TestimonialsSectionForm from '@modules/admin/components/editor-forms/TestimonialsSectionForm';
import ReservationCtaSectionForm from '@modules/admin/components/editor-forms/ReservationCtaSectionForm';
import LocationSectionForm from '@modules/admin/components/editor-forms/LocationSectionForm';

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

const FormComponentMap: { [key: string]: React.FC<any> } = {
    hero: HeroSectionForm,
    about: AboutSectionForm,
    'featured-menu': FeaturedMenuSectionForm,
    promotion: PromotionSectionForm,
    gallery: GallerySectionForm,
    testimonials: TestimonialsSectionForm,
    'reservation-cta': ReservationCtaSectionForm,
    location: LocationSectionForm,
};

const EditSectionPage: React.FC = () => {
    const { sectionId } = useParams<{ sectionId: string }>();
    const { config, loading, updateSection } = useHomepageContent();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const section = config?.sections.find(s => s.id === sectionId);

    const handleSubmit = async (newProps: any) => {
        if (!section) return;
        try {
            await updateSection(section.id, newProps);
            addToast('Section berhasil diperbarui!', 'success');
            navigate('/admin/tampilan');
        } catch (error) {
            addToast('Gagal memperbarui section.', 'error');
        }
    };

    const FormComponent = section ? FormComponentMap[section.type] : null;
    const pageTitle = section ? `Edit: ${sectionTypeToName[section.type]}` : 'Memuat Editor...';


    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
                <SkeletonLoader className="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-24 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
        );
    }

    if (!section || !FormComponent) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <h2 className="text-xl font-bold text-brand-dark dark:text-gray-200">Section Tidak Ditemukan</h2>
                <p className="text-brand-secondary dark:text-gray-400 mt-2 mb-6">Section yang Anda coba edit tidak ada.</p>
                <Link to="/admin/tampilan" className="text-brand-primary hover:underline font-medium inline-flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Kustomisasi
                </Link>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <Link to="/admin/tampilan" className="text-brand-primary hover:underline font-medium inline-flex items-center text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Kustomisasi Homepage
                </Link>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">{pageTitle}</h2>
                <FormComponent initialData={section.props} onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default EditSectionPage;
