
import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import { BookOpen, Users, ClipboardList } from 'lucide-react';
import LineChart from '../components/LineChart';

const weeklyReservationsData = [
    { day: 'Sen', value: 18 },
    { day: 'Sel', value: 24 },
    { day: 'Rab', value: 22 },
    { day: 'Kam', value: 30 },
    { day: 'Jum', value: 45 },
    { day: 'Sab', value: 52 },
    { day: 'Min', value: 35 },
];

const AdminDashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <>
            {/* Stats Section */}
            <section className="mb-12">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                    <StatCard
                        title="Total Item Menu"
                        value="10"
                        icon={<BookOpen className="w-8 h-8 text-brand-primary" />}
                    />
                    <StatCard
                        title="Reservasi Hari Ini"
                        value="24"
                        icon={<Users className="w-8 h-8 text-brand-primary" />}
                    />
                    <StatCard
                        title="Pesanan Tertunda"
                        value="3"
                        icon={<ClipboardList className="w-8 h-8 text-brand-primary" />}
                    />
                </div>
            </section>

            {/* Chart Section */}
            <section>
                <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 mb-6">Reservasi Minggu Ini</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-96">
                    <LineChart data={weeklyReservationsData} />
                </div>
            </section>
        </>
    );
};

export default AdminDashboardPage;