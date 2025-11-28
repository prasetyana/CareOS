
import React from 'react';

const TampilanHeader: React.FC = () => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Editor Header</h2>
            <p className="text-brand-secondary">
                Halaman ini akan berisi formulir untuk menyesuaikan tampilan dan nuansa header publik, seperti mengubah logo, menyesuaikan tautan navigasi, atau mengubah perilakunya.
            </p>
        </div>
    );
};

export default TampilanHeader;
