import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PromotionBanner } from '@core/data/mockDB';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@core/hooks/useCart';
import { useChat } from '@core/hooks/useChat';
import { useNotifications } from '@core/hooks/useNotifications';
import { useCustomerLayout } from '@core/contexts/CustomerLayoutContext';

interface PromoSliderProps {
    banners: PromotionBanner[];
}

const sliderVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.98,
    }),
    center: {
        x: '0%',
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.98,
    }),
};

const textVariants = {
    initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -20, filter: 'blur(4px)', transition: { duration: 0.25 } },
};

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};


const PromoSlider: React.FC<PromoSliderProps> = ({ banners }) => {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isHovered, setIsHovered] = useState(false);

    const { isCartOpen } = useCart();
    const { isChatOpen } = useChat();
    const { isNotificationPanelOpen } = useNotifications();
    const { isSidebarCollapsed } = useCustomerLayout();

    // Check if any right panel is open
    const isRightPanelOpen = isCartOpen || isChatOpen || isNotificationPanelOpen;
    // Left sidebar is visible when not collapsed
    const isLeftSidebarOpen = !isSidebarCollapsed;

    const currentIndex = page;

    const paginate = (newDirection: number) => {
        setPage([(page + newDirection + banners.length) % banners.length, newDirection]);
    };

    useEffect(() => {
        if (banners.length <= 1 || isHovered) return;
        const interval = setInterval(() => {
            paginate(1);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length, page, isHovered]);

    const currentBanner = banners[currentIndex];

    if (!currentBanner) return null;

    return (
        <div
            className="relative w-full aspect-[4/5] md:aspect-[16/7] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 dark:border-white/5 group"
            style={{
                boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.15), 0 8px 24px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-live="polite"
            aria-atomic="true"
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={page}
                    custom={direction}
                    variants={sliderVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 280, damping: 32 },
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
                            paginate(1);
                        } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
                            paginate(-1);
                        }
                    }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                    <img src={currentBanner.image} alt={currentBanner.title} className="w-full h-full object-cover" />
                    {/* Enhanced gradient for mobile portrait aspect */}
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/95 via-black/60 to-black/10 md:from-black/75 md:via-black/30 md:to-transparent"></div>
                    {/* Subtle ambient light effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent"></div>
                </motion.div>
            </AnimatePresence>

            {/* Mobile-optimized content positioning */}
            <div className="relative z-10 p-5 md:p-12 flex flex-col justify-end h-full text-white pointer-events-none pb-16 md:pb-12">
                <AnimatePresence mode="wait">
                    <motion.h2
                        key={`title-${currentIndex}`}
                        variants={textVariants}
                        initial="initial"
                        animate={{ ...textVariants.animate, transition: { delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                        exit={textVariants.exit}
                        className={`font-bold tracking-tight leading-[1.15] md:leading-[1.1] max-w-md transition-all duration-300 ${isRightPanelOpen
                            ? 'text-[26px] md:text-xl'
                            : isLeftSidebarOpen
                                ? 'text-[26px] md:text-2xl'
                                : 'text-[26px] md:text-[42px]'
                            }`}
                        style={{ textShadow: '0 2px 16px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.6)' }}
                    >
                        {currentBanner.title}
                    </motion.h2>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={`subtitle-${currentIndex}`}
                        variants={textVariants}
                        initial="initial"
                        animate={{ ...textVariants.animate, transition: { delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                        exit={textVariants.exit}
                        className={`mt-2.5 md:mt-3 font-medium tracking-tight text-white/95 max-w-md leading-relaxed transition-all duration-300 ${isRightPanelOpen
                            ? 'text-[15px] md:text-sm'
                            : isLeftSidebarOpen
                                ? 'text-[15px] md:text-base'
                                : 'text-[15px] md:text-lg'
                            }`}
                        style={{ textShadow: '0 1px 10px rgba(0, 0, 0, 0.3)' }}
                    >
                        {currentBanner.subtitle}
                    </motion.p>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`cta-${currentIndex}`}
                        variants={textVariants}
                        initial="initial"
                        animate={{ ...textVariants.animate, transition: { delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                        exit={textVariants.exit}
                        className={
                            isRightPanelOpen
                                ? 'mt-4 md:mt-4'
                                : isLeftSidebarOpen
                                    ? 'mt-4 md:mt-5'
                                    : 'mt-5 md:mt-6'
                        }
                    >
                        <Link
                            to={currentBanner.cta.link}
                            className={`bg-white/95 text-text-primary font-semibold rounded-full hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center group/cta backdrop-blur-md pointer-events-auto border border-white/20 shadow-lg shadow-black/10 ${isRightPanelOpen
                                ? 'py-3 px-6 md:py-2 md:px-4 text-sm md:text-xs'
                                : isLeftSidebarOpen
                                    ? 'py-3 px-6 md:py-2.5 md:px-5 text-sm md:text-sm'
                                    : 'py-3 px-6 md:py-3 md:px-7 text-sm md:text-sm'
                                }`}
                        >
                            {currentBanner.cta.text}
                            <ArrowRight className={`ml-2 transition-transform duration-200 group-hover/cta:translate-x-1 ${isRightPanelOpen
                                ? 'w-4 h-4 md:w-3.5 md:h-3.5'
                                : isLeftSidebarOpen
                                    ? 'w-4 h-4 md:w-3.5 md:h-3.5'
                                    : 'w-4 h-4 md:w-4 md:h-4'
                                }`} />
                        </Link>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile-optimized pagination with larger touch targets */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 md:bottom-4 md:right-4 md:left-auto md:translate-x-0 flex gap-1.5 z-20 bg-black/25 backdrop-blur-md rounded-full px-2.5 py-2 md:px-2 md:py-1.5">
                {banners.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => setPage([index, index > currentIndex ? 1 : -1])}
                        className="relative overflow-hidden rounded-full p-1 md:p-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        <motion.div
                            className={`h-2 md:h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-white/40'}`}
                            animate={{
                                width: currentIndex === index
                                    ? (isRightPanelOpen ? '20px' : isLeftSidebarOpen ? '24px' : '28px')
                                    : (isRightPanelOpen ? '5px' : isLeftSidebarOpen ? '6px' : '8px'),
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30
                            }}
                        />
                    </motion.button>
                ))}
            </div>

            {/* Enhanced navigation arrows (desktop only) */}
            {banners.length > 1 && (
                <>
                    <motion.button
                        onClick={() => paginate(-1)}
                        className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-4 z-20 p-3 bg-white/15 rounded-full text-white backdrop-blur-md items-center justify-center border border-white/10 shadow-lg shadow-black/10"
                        aria-label="Previous slide"
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{
                            opacity: 1,
                            x: 0,
                            scale: 1.05,
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            x: isHovered ? 0 : -10,
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        onClick={() => paginate(1)}
                        className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-4 z-20 p-3 bg-white/15 rounded-full text-white backdrop-blur-md items-center justify-center border border-white/10 shadow-lg shadow-black/10"
                        aria-label="Next slide"
                        initial={{ opacity: 0, x: 10 }}
                        whileHover={{
                            opacity: 1,
                            x: 0,
                            scale: 1.05,
                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            x: isHovered ? 0 : 10,
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>
                </>
            )}
        </div>
    );
};

export default PromoSlider;