
import React from 'react';

const AdminFeedbackPage: React.FC = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto p-10 bg-white border rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold font-sans text-brand-dark mb-4 text-center">Customer Feedback</h2>
                <p className="text-center text-brand-secondary text-lg">
                    This page will display feedback, ratings, and reviews submitted by customers.
                    Admins can review comments, track customer satisfaction, and respond to inquiries.
                </p>
            </div>
        </div>
    );
};

export default AdminFeedbackPage;
