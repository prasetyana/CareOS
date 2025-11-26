

import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link, useNavigate } from "react-router-dom";
import { useHomepageContent } from '../../hooks/useHomepageContent';
import { useToast } from '../../hooks/useToast';
import SkeletonLoader from '../../components/SkeletonLoader';
import { ArrowLeft } from 'lucide-react';
import HeaderForm from '../../components/admin/editor-forms/HeaderForm';
import { HeaderConfig } from '../../types/homepage';

const EditHeaderPage: React.FC = () => {
    const { config, loading, updateHeader } = useHomepageContent();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (newHeaderConfig: Partial<HeaderConfig>) => {
        try {
            await updateHeader(newHeaderConfig);
            addToast('Header berhasil diperbarui!', 'success');
            navigate('/admin/tampilan');
        } catch (error) {
            addToast('Gagal memperbarui header.', 'error');
        }
    };

    if (loading || !config?.header) {
        return (
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
                <SkeletonLoader className="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
            </div>
        );
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
                <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Edit Header</h2>
                <HeaderForm initialData={config.header} onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default EditHeaderPage;
