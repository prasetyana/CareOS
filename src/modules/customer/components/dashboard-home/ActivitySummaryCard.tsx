import React from 'react';
import { Link } from 'react-router-dom';
import { Reservation } from '../../../data/mockDB';
import { Calendar } from 'lucide-react';
import { useTenantParam } from '../../../hooks/useTenantParam';

interface ActivitySummaryCardProps {
    reservation: Reservation | null;
}

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({ reservation }) => {
    const { withTenant } = useTenantParam();
    const hasUpcomingReservation = reservation && reservation.status === 'Dikonfirmasi';

    const content = hasUpcomingReservation ? (
        <>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-text-primary">Reservasi Berikutnya</h3>
                <Calendar className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-text-primary">{reservation.date}</p>
            <p className="text-md text-text-muted">{reservation.time} - {reservation.partySize} orang</p>
            <Link to={withTenant("/akun/reservasi/riwayat")} className="mt-6 block w-full text-center bg-accent/10 text-accent font-semibold py-2.5 rounded-lg text-sm hover:bg-accent/20 transition-colors">
                Kelola Reservasi
            </Link>
        </>
    ) : (
        <>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-text-primary">Buat Reservasi</h3>
                <Calendar className="w-5 h-5 text-accent" />
            </div>
            <p className="text-lg text-text-muted mt-4">Belum ada reservasi. Ingin booking meja untuk akhir pekan?</p>
            <Link to={withTenant("/akun/reservasi/buat")} className="mt-6 block w-full text-center bg-accent/10 text-accent font-semibold py-2.5 rounded-lg text-sm hover:bg-accent/20 transition-colors">
                Reservasi Sekarang
            </Link>
        </>
    );

    return (
        <div className="p-6 rounded-3xl bg-surface/80 backdrop-blur-xl border border-glass-border shadow-card flex flex-col justify-between">
            {content}
        </div>
    );
};

export default ActivitySummaryCard;
