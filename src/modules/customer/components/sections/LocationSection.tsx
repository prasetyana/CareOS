import React from 'react';

const LocationSection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Our Location</h2>
                <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <p>Map Placeholder</p>
                </div>
            </div>
        </section>
    );
};

export default LocationSection;
