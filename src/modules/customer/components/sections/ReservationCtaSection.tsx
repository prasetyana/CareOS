import React from 'react';

const ReservationCtaSection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-accent text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">Book a Table</h2>
                <p className="mb-8">Reserve your spot today.</p>
                <button className="bg-white text-accent px-6 py-3 rounded-full font-bold">Book Now</button>
            </div>
        </section>
    );
};

export default ReservationCtaSection;
