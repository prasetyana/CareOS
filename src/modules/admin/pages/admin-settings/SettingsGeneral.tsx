
import React from 'react';

const SettingsGeneral: React.FC = () => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">General Settings</h2>
            <p className="text-brand-secondary">
                This is where general site settings would go. For example, you might configure the site name,
                contact information, or social media links here.
            </p>
        </div>
    );
};

export default SettingsGeneral;
