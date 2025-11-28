import React from 'react';

const TestimonialsSection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Testimonials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <p>"Great food!"</p>
                        <p className="mt-4 font-bold">- Customer</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow">
                        <p>"Excellent service!"</p>
                        <p className="mt-4 font-bold">- Customer</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
