import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuItemForm from '@modules/admin/components/MenuItemForm';
import { useToast } from '@core/hooks/useToast';
import { fetchMenuItemBySlug, MenuItem } from '@core/data/mockDB';

const EditMenuBaru: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [item, setItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadItem = async () => {
            if (slug) {
                const fetchedItem = await fetchMenuItemBySlug(slug);
                if (fetchedItem) {
                    setItem(fetchedItem);
                } else {
                    addToast("Item menu tidak ditemukan.", 'error');
                    navigate('/admin/menu/kelola-menu');
                }
            }
            setLoading(false);
        };
        loadItem();
    }, [slug, navigate, addToast]);

    const handleSuccess = () => {
        addToast("Item menu berhasil diperbarui!", 'success');
        navigate('/admin/menu/kelola-menu');
    };

    if (loading) {
        return <div className="p-8 text-center">Memuat data...</div>;
    }

    if (!item) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Edit Menu</h2>
            <MenuItemForm initialData={item} onSuccess={handleSuccess} />
        </div>
    );
};

export default EditMenuBaru;
