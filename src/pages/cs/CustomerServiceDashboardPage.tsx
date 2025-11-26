
import React from 'react';
import StatCard from '../../components/StatCard';
import { MessagesSquare, Inbox, HelpCircle } from 'lucide-react';

const CustomerServiceDashboardPage: React.FC = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-sans text-text-primary">Dasbor Customer Service</h1>
        <p className="text-text-muted mt-1">Selamat datang! Berikut adalah ringkasan aktivitas hari ini.</p>
      </div>
      <section className="mb-12">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                <StatCard 
                    title="Live Chat Aktif"
                    value="2"
                    icon={<MessagesSquare className="w-8 h-8 text-brand-primary" />}
                />
                <StatCard 
                    title="Pesan Baru"
                    value="5"
                    icon={<Inbox className="w-8 h-8 text-brand-primary" />}
                />
                <StatCard 
                    title="FAQ Diterbitkan"
                    value="15"
                    icon={<HelpCircle className="w-8 h-8 text-brand-primary" />}
                />
            </div>
        </section>
        <section>
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200 border-b dark:border-gray-700 pb-4 mb-6">Aktivitas Terkini</h2>
                <p className="text-brand-secondary dark:text-gray-400">
                    Area ini akan menampilkan log aktivitas terkini, seperti chat yang baru selesai, pesan yang dibalas, atau pembaruan FAQ.
                </p>
            </div>
        </section>
    </>
  );
};

export default CustomerServiceDashboardPage;
