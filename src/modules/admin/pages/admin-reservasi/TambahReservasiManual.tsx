
import React from 'react';

const TambahReservasiManual: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Tambah Reservasi Manual</h2>
            <p className="text-brand-secondary">
                Halaman ini akan berisi formulir bagi administrator untuk menambahkan reservasi baru secara manual untuk pelanggan, misalnya, dari panggilan telepon.
            </p>
        </div>
    );
};

export default TambahReservasiManual;
