import React from 'react';

const PromotionSection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4 text-yellow-800 dark:text-yellow-200">Special Promotion</h2>
                <p className="mb-8 text-yellow-700 dark:text-yellow-300">Get 20% off on all main courses!</p>
            </div>
        </section>
    );
};

export default PromotionSection;
