import React from 'react';

const FeaturesSection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Fresh Ingredients</h3>
                        <p>We use only the freshest ingredients.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Expert Chefs</h3>
                        <p>Our chefs are world-class.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
                        <p>We deliver hot and fresh.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
