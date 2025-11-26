
import React from 'react';

const JadwalReservasi: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Jadwal Reservasi</h2>
            <p className="text-brand-secondary">
                Halaman ini akan menampilkan kalender atau tampilan jadwal dari semua reservasi yang akan datang. Admin dapat mengelola ketersediaan meja dan melihat gambaran umum pemesanan restoran.
            </p>
        </div>
    );
};

export default JadwalReservasi;
