

import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { ChevronRight } from 'lucide-react';

const SettingsContent: React.FC = () => {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold font-sans text-brand-dark border-b pb-4 mb-6">Content Management</h2>
            <p className="text-brand-secondary mb-6 text-sm">
                Edit the content of your public-facing website pages.
            </p>
            <div className="space-y-2">
                <Link 
                    to="/admin/homepage" 
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border"
                >
                    <div>
                        <h3 className="font-semibold text-brand-dark">Homepage Editor</h3>
                        <p className="text-sm text-brand-secondary">Customize the hero section and other homepage content.</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                </Link>
                {/* Add links to other page editors here in the future */}
            </div>
        </div>
    );
};

export default SettingsContent;
