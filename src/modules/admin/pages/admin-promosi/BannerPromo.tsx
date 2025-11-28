
import React from 'react';

const BannerPromo: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Banner Promo</h2>
            <p className="text-brand-secondary">
                Halaman ini akan memungkinkan administrator untuk mengelola banner promosi yang ditampilkan di situs web publik. Fungsionalitas akan mencakup mengunggah gambar, menambahkan teks, dan mengatur jadwal tayang.
            </p>
        </div>
    );
};

export default BannerPromo;
