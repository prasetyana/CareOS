
import React from 'react';

const AdminAnalyticsPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto p-10 bg-white border rounded-2xl shadow-xl">
                 <h2 className="text-2xl font-bold font-sans text-brand-dark mb-4 text-center">Analytics</h2>
                <p className="text-center text-brand-secondary text-lg">
                    This page will feature advanced data visualizations and reports.
                    Admins will be able to track sales trends, popular menu items, peak hours, and other key performance indicators.
                </p>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
