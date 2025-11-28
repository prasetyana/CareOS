import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useLocation } from '@core/contexts/LocationContext';

const RealTimeStatusWidget: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { selectedBranch, openLocationModal } = useLocation();
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Update time every second to check open/closed status.
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        // Check if text overflows container
        if (textRef.current && containerRef.current) {
            const textWidth = textRef.current.scrollWidth;
            const containerWidth = containerRef.current.clientWidth;
            setShouldAnimate(textWidth > containerWidth);
        }
    }, [selectedBranch]);

    const currentHour = currentTime.getHours();
    // Simplified for this widget based on Contact.tsx hours
    const isOpen = currentHour >= 17 && currentHour < 23;

    return (
        <button
            onClick={openLocationModal}
            className="flex items-center justify-between lg:justify-start gap-3 h-10 lg:h-9 px-4 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-black/60 transition-all cursor-pointer w-full lg:w-auto"
        >
            {/* Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {isOpen ? (
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400">Buka</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span className="text-[13px] font-medium text-red-600 dark:text-red-400">Tutup</span>
                    </div>
                )}
            </div>

            {/* Branch Info with Running Text */}
            {selectedBranch && (
                <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1 overflow-hidden pl-2 border-l border-gray-200 dark:border-gray-700" ref={containerRef}>
                    <MapPin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1 overflow-hidden relative text-right">
                        {shouldAnimate ? (
                            <div className="animate-marquee whitespace-nowrap inline-block">
                                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 inline-block pr-8">
                                    {selectedBranch.name}
                                </span>
                                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200 inline-block pr-8">
                                    {selectedBranch.name}
                                </span>
                            </div>
                        ) : (
                            <div ref={textRef} className="whitespace-nowrap">
                                <span className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                                    {selectedBranch.name}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </button>
    );
};

export default RealTimeStatusWidget;
