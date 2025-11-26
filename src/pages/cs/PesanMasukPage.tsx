
import React from 'react';

const PesanMasukPage: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Pesan Masuk</h2>
            <p className="text-brand-secondary dark:text-gray-400">
                Halaman ini akan menampilkan daftar pesan masuk dari pelanggan (misalnya, dari formulir kontak) dan memungkinkan agen untuk membalasnya.
            </p>
        </div>
    );
};

export default PesanMasukPage;
