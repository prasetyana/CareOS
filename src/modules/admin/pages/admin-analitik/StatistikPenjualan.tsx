
import React from 'react';

const StatistikPenjualan: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Statistik Penjualan</h2>
            <p className="text-brand-secondary">
                Halaman ini akan menampilkan grafik dan visualisasi data terkait kinerja penjualan dari waktu ke waktu. Admin dapat melacak pendapatan, nilai pesanan rata-rata, dan metrik keuangan utama lainnya.
            </p>
        </div>
    );
};

export default StatistikPenjualan;
