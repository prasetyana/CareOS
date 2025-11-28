import React from 'react';

const CtaSection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
                <p className="mb-8">Order now and get it delivered to your doorstep.</p>
                <button className="bg-accent text-white px-8 py-3 rounded-full font-bold">Order Now</button>
            </div>
        </section>
    );
};

export default CtaSection;
