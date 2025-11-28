import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useTenantParam } from '@core/hooks/useTenantParam';
import { Reservation, fetchReservationsByCustomerId } from '@core/data/mockDB';
import { Calendar, Clock, Users } from 'lucide-react';
import SkeletonLoader from '@ui/SkeletonLoader';

const StatusBadge: React.FC<{ status: Reservation['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium";
    const statusClasses = {
        'Dikonfirmasi': 'bg-success/10 text-success',
        'Selesai': 'bg-black/10 dark:bg-white/10 text-text-muted',
        'Dibatalkan': 'bg-danger/10 text-danger',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const ReservationCard: React.FC<{ reservation: Reservation }> = ({ reservation }) => (
    <div className="border border-black/10 dark:border-white/10 p-4 rounded-xl transition-all hover:shadow-md hover:-translate-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                    <p className="font-medium tracking-wide text-text-primary mr-4">Reservasi #{reservation.reservationNumber}</p>
                    <StatusBadge status={reservation.status} />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {reservation.date}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {reservation.time}</span>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {reservation.partySize} orang</span>
                </div>
            </div>
            {reservation.status === 'Dikonfirmasi' && (
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <button className="text-xs font-medium text-accent hover:underline">Ubah</button>
                    <button className="text-xs font-medium text-danger hover:underline">Batalkan</button>
                </div>
            )}
        </div>
    </div>
);

interface CustomerReservationsPageProps {
    filter?: 'active' | 'history';
}

const CustomerReservationsPage: React.FC<CustomerReservationsPageProps> = ({ filter = 'active' }) => {
    const { user } = useAuth();
    const { withTenant } = useTenantParam();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReservations = async () => {
            if (user) {
                setLoading(true);
                const fetchedReservations = await fetchReservationsByCustomerId(user.id);
                setReservations(fetchedReservations);
                setLoading(false);
            }
        };
        loadReservations();
    }, [user]);

    const filteredReservations = reservations.filter(r => {
        if (filter === 'active') return r.status === 'Dikonfirmasi';
        return r.status !== 'Dikonfirmasi';
    });

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-black/10 dark:border-white/10 p-4 rounded-xl flex justify-between items-center">
                        <div className="space-y-2">
                            <SkeletonLoader className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                            <SkeletonLoader className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-700" />
                        </div>
                        <SkeletonLoader className="h-8 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {filteredReservations.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-medium text-text-primary">
                        {filter === 'active' ? 'Tidak Ada Reservasi Aktif' : 'Tidak Ada Riwayat Reservasi'}
                    </h3>
                    <p className="mt-2 text-text-muted">
                        {filter === 'active'
                            ? 'Anda tidak memiliki reservasi yang akan datang saat ini.'
                            : 'Anda belum memiliki riwayat reservasi yang selesai atau dibatalkan.'}
                    </p>
                    {filter === 'active' && (
                        <Link to={withTenant("/akun/reservasi/buat")} className="mt-6 inline-block bg-accent text-white font-medium py-2 px-5 rounded-full hover:bg-opacity-90 transition-colors duration-300">
                            Buat Reservasi
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReservations.map((res) => (
                        <div key={res.id}>
                            <ReservationCard reservation={res} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerReservationsPage;
