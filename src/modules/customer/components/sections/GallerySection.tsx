import React from 'react';

const GallerySection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Placeholder content */}
                    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </div>
            </div>
        </section>
    );
};

export default GallerySection;
