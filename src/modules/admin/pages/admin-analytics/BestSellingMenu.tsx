
import React from 'react';

const MenuTerlaris: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Menu Terlaris</h2>
            <p className="text-brand-secondary">
                Halaman ini akan menampilkan laporan tentang item menu yang paling populer dan menguntungkan, membantu administrator membuat keputusan berbasis data tentang menu.
            </p>
        </div>
    );
};

export default MenuTerlaris;
