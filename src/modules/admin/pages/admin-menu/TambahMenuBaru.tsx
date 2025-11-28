import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@core/hooks/useToast';
import MenuItemForm from '@modules/admin/components/MenuItemForm';

const TambahMenuBaru: React.FC = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSuccess = () => {
        addToast("Item menu berhasil ditambahkan!", 'success');
        navigate('/admin/menu/kelola-menu');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Tambah Menu Baru</h2>
            <MenuItemForm onSuccess={handleSuccess} />
        </div>
    );
};

export default TambahMenuBaru;