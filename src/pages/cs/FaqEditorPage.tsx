import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { KnowledgeBaseItem, fetchKnowledgeBaseItemById } from '../../data/mockDB';
import FaqItemForm from '../../components/cs/FaqItemForm';
import { ArrowLeft } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';

const FaqEditorPage: React.FC = () => {
    const { faqId } = useParams<{ faqId: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const isEditMode = !!faqId;
    const [initialData, setInitialData] = useState<KnowledgeBaseItem | null>(null);
    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode && faqId) {
            const loadItem = async () => {
                const item = await fetchKnowledgeBaseItemById(Number(faqId));
                if (item) {
                    setInitialData(item);
                } else {
                    addToast('FAQ tidak ditemukan.', 'error');
                    navigate('/cs/kelola-faq');
                }
                setLoading(false);
            };
            loadItem();
        }
    }, [faqId, isEditMode, navigate, addToast]);
    
    const handleSuccess = () => {
        addToast(`FAQ berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}.`, 'success');
        navigate('/cs/kelola-faq');
    };
    
    const handleCancel = () => {
        navigate('/cs/kelola-faq');
    };
    
    if (loading) {
        return (
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <SkeletonLoader className="h-8 w-1/3 rounded mb-6 bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-12 w-full rounded mb-4 bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-24 w-full rounded mb-4 bg-gray-200 dark:bg-gray-700" />
                <SkeletonLoader className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
             </div>
        )
    }

    return (
        <div>
            <button onClick={handleCancel} className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary mb-6">
                <ArrowLeft size={16} />
                Kembali ke Kelola FAQ
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">
                    {isEditMode ? 'Edit FAQ' : 'Tambah FAQ Baru'}
                </h2>
                <FaqItemForm
                    initialData={initialData}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default FaqEditorPage;
