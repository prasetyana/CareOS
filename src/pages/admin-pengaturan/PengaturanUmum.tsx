
import React from 'react';

const PengaturanUmum: React.FC = () => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Pengaturan Umum</h2>
            <p className="text-brand-secondary">
                Halaman ini akan menampung pengaturan aplikasi umum, seperti preferensi bahasa, zona waktu, mata uang, dan pengaturan notifikasi untuk admin.
            </p>
        </div>
    );
};

export default PengaturanUmum;
