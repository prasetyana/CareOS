
import React from 'react';
import { Event } from '../../../data/mockDB';
import ContentCarousel from './ContentCarousel';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventCornerProps {
    events: Event[];
    visibleItems?: number;
}

// Helper to generate a fake date based on ID for UI demonstration
const getEventDate = (id: number) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const date = new Date();
    date.setDate(date.getDate() + id * 3); // Future dates
    return {
        day: date.getDate(),
        month: months[date.getMonth()]
    };
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    const { day, month } = getEventDate(event.id);

    return (
        <motion.div 
            className="group relative h-[420px] w-full overflow-hidden rounded-[32px] cursor-pointer bg-neutral-900"
            whileHover="hover"
            initial="rest"
        >
            {/* Background Image with Slow Zoom */}
            <motion.div 
                className="absolute inset-0 w-full h-full"
                variants={{
                    rest: { scale: 1 },
                    hover: { scale: 1.1 }
                }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-opacity duration-500" 
                />
            </motion.div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

            {/* Top Elements */}
            <div className="absolute top-0 left-0 w-full p-5 flex justify-between items-start">
                {/* Glassmorphism Date Badge */}
                <div className="flex flex-col items-center justify-center w-14 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white">
                    <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">{month}</span>
                    <span className="text-2xl font-bold leading-none">{day}</span>
                </div>

                {/* Category Pill */}
                <div className="px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-medium text-white tracking-wide uppercase shadow-sm">
                    {event.category}
                </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 w-full p-6 flex flex-col justify-end">
                <motion.div
                    variants={{
                        rest: { y: 0 },
                        hover: { y: -8 }
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <h4 className="text-2xl font-bold text-white leading-tight mb-2 line-clamp-2 font-sans text-balance shadow-black drop-shadow-md">
                        {event.title}
                    </h4>
                    <p className="text-sm text-gray-300 line-clamp-2 opacity-90 mb-4 font-medium leading-relaxed">
                        Temukan pengalaman kuliner yang tak terlupakan bersama kami. Klik untuk detail acara selengkapnya.
                    </p>
                </motion.div>

                {/* Action Button Reveal */}
                <motion.div
                    className="flex items-center gap-3"
                    variants={{
                        rest: { opacity: 0.6, y: 10 },
                        hover: { opacity: 1, y: 0 }
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-black group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-lg">
                        <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
                    </div>
                    <span className="text-sm font-semibold text-white tracking-wide opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75">
                        Lihat Detail
                    </span>
                </motion.div>
            </div>
        </motion.div>
    );
};


const EventCorner: React.FC<EventCornerProps> = ({ events, visibleItems }) => {
    return (
        <section className="py-4">
            <div className="flex items-end justify-between mb-8 px-1">
                <div>
                    <h2 className="text-3xl font-bold font-sans text-text-primary dark:text-white flex items-center gap-3">
                        Acara & Berita
                        <span className="hidden sm:inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider">
                            Terbaru
                        </span>
                    </h2>
                    <p className="text-text-muted mt-2 text-lg">Jangan lewatkan momen spesial di DineOS.</p>
                </div>
                <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors group">
                    Lihat Semua
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
            </div>
            
             <div className="h-[460px] -mx-8 px-8">
                <ContentCarousel<Event>
                    items={events}
                    visibleItems={visibleItems || 3} // Use passed visibleItems or default to 3
                    renderItem={(event) => (
                        <EventCard event={event} />
                    )}
                />
            </div>
        </section>
    );
};

export default EventCorner;
