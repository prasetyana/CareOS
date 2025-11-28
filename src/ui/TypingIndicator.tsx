
import React from 'react';
import { motion } from 'framer-motion';

const dotVariants = {
    initial: { y: 0 },
    animate: {
        y: [0, -4, 0],
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

const TypingIndicator: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 p-3"
        >
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-600">
                <motion.span
                    className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    style={{ transitionDelay: '0s' }}
                />
                <motion.span
                    className="w-1.5 h-1.5 bg-neutral-500 rounded-full mx-0.5"
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    style={{ animationDelay: '0.2s' }}
                />
                <motion.span
                    className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    style={{ animationDelay: '0.4s' }}
                />
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
