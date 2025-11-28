
import React from 'react';

const AdminReservationsPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto p-10 bg-white border rounded-2xl shadow-xl">
                 <h2 className="text-2xl font-bold font-sans text-brand-dark mb-4 text-center">Reservations</h2>
                <p className="text-center text-brand-secondary text-lg">
                    This page will feature a calendar or list view of all table reservations.
                    Admins will be able to add new reservations, confirm pending ones, and manage table availability.
                </p>
            </div>
        </div>
    );
};

export default AdminReservationsPage;
