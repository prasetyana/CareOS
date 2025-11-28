import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// A hook to measure an element's width
const useContainerWidth = (ref: React.RefObject<HTMLElement>) => {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                setWidth(entries[0].contentRect.width);
            }
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [ref]);

    return width;
};

interface ContentCarouselProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    visibleItems?: number; // Optional override for number of visible items
}

const sliderVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
    }),
    center: {
        x: '0%',
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
    }),
};

const ContentCarousel = <T,>({ items, renderItem, visibleItems }: ContentCarouselProps<T>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const containerWidth = useContainerWidth(containerRef);

    const getSlidesPerView = (width: number) => {
        if (visibleItems) return visibleItems; // Use override if provided
        if (width > 1200) return 5;
        if (width > 960) return 4;
        if (width > 720) return 3;
        if (width > 480) return 2;
        return 1;
    };

    const slidesPerView = getSlidesPerView(containerWidth);
    const totalPages = items.length > 0 ? Math.ceil(items.length / slidesPerView) : 0;

    const [[page, direction], setPage] = useState([0, 0]);

    const paginate = (newDirection: number) => {
        let newPage = page + newDirection;
        if (totalPages === 0) return;
        if (newPage < 0) newPage = totalPages - 1;
        else if (newPage >= totalPages) newPage = 0;
        setPage([newPage, newDirection]);
    };

    // Reset page if totalPages changes (e.g. on resize)
    useEffect(() => {
        if (page >= totalPages && totalPages > 0) {
            setPage([totalPages - 1, 0]);
        } else if (totalPages <= 1) {
            setPage([0, 0]);
        }
    }, [totalPages, page]);

    const startIndex = page * slidesPerView;
    const endIndex = startIndex + slidesPerView;
    const visibleItemsData = items.slice(startIndex, endIndex);

    const SWIPE_CONFIDENCE_THRESHOLD = 10000;
    const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

    return (
        <div
            ref={containerRef}
            className="relative h-full group/carousel"
        >
            {/* Content container */}
            <div className="overflow-hidden relative h-full flex items-start">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={sliderVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.5}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x);
                            if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) paginate(1);
                            else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) paginate(-1);
                        }}
                        className="absolute inset-0 grid gap-4 cursor-grab active:cursor-grabbing items-start"
                        style={{ gridTemplateColumns: `repeat(${slidesPerView > 0 ? slidesPerView : 1}, 1fr)` }}
                    >
                        {visibleItemsData.map((item, index) => {
                            const element = renderItem(item, startIndex + index);
                            return React.cloneElement(element as React.ReactElement, { key: startIndex + index });
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {totalPages > 1 && (
                <>
                    <button
                        onClick={() => paginate(-1)}
                        className="absolute top-[38%] -translate-y-1/2 -left-4 z-10 p-2.5 bg-white/80 dark:bg-neutral-800/80 rounded-full text-gray-900 dark:text-white backdrop-blur-md shadow-lg border border-white/20 dark:border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                        aria-label="Previous items"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="absolute top-[38%] -translate-y-1/2 -right-4 z-10 p-2.5 bg-white/80 dark:bg-neutral-800/80 rounded-full text-gray-900 dark:text-white backdrop-blur-md shadow-lg border border-white/20 dark:border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                        aria-label="Next items"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-2 right-4 flex gap-1.5 z-20">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setPage([index, index > page ? 1 : -1])}
                                className={`h-1.5 rounded-full transition-all duration-300 ${page === index ? 'w-6 bg-blue-600' : 'w-1.5 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'}`}
                                aria-label={`Go to page ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ContentCarousel;
