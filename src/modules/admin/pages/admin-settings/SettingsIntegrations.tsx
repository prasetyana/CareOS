
import React from 'react';

const SettingsIntegrations: React.FC = () => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Integrations</h2>
            <p className="text-brand-secondary">
                Connect third-party services to your website. For example, you might integrate with a reservation
                system, a payment gateway, or marketing automation tools here.
            </p>
        </div>
    );
};

export default SettingsIntegrations;
