import React from 'react';

const HeroSection: React.FC<any> = (props) => {
    return (
        <section className="relative h-[500px] bg-gray-900 flex items-center justify-center text-white">
            <div className="text-center">
                <h1 className="text-5xl font-bold mb-4">Welcome to DineOS</h1>
                <p className="text-xl">Experience the best dining.</p>
            </div>
        </section>
    );
};

export default HeroSection;
