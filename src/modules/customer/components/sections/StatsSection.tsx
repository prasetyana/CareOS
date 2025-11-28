import React from 'react';

const StatsSection: React.FC<any> = (props) => {
    return (
        <section className="py-12 bg-accent text-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <h3 className="text-4xl font-bold">10k+</h3>
                        <p>Happy Customers</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold">50+</h3>
                        <p>Menu Items</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold">5+</h3>
                        <p>Years Experience</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold">4.9</h3>
                        <p>Rating</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
