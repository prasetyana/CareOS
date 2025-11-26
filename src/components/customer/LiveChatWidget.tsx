import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import CustomerChatView from './CustomerChatView';
import { useLiveChat } from '../../contexts/LiveChatContext';

const ProactiveBubble: React.FC<{ onDismiss: (e: React.MouseEvent) => void }> = ({ onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
        exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
        className="fixed bottom-24 right-6 z-40"
    >
        <div className="relative bg-white dark:bg-neutral-700 rounded-xl p-3 shadow-lg max-w-[200px] text-sm text-text-primary dark:text-gray-200">
            <button onClick={onDismiss} className="absolute -top-1 -right-1 bg-neutral-200 dark:bg-neutral-600 rounded-full p-0.5">
                <X size={12}/>
            </button>
            <p>Ada yang bisa kami bantu?</p>
            {/* Pointer */}
            <div className="absolute right-4 -bottom-2 w-4 h-4 bg-white dark:bg-neutral-700 transform rotate-45"></div>
        </div>
    </motion.div>
);


const ChatBubble: React.FC<{ onClick: () => void; unreadCount: number }> = ({ onClick, unreadCount }) => (
    <motion.button
        onClick={onClick}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent rounded-full text-white flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Buka live chat"
    >
        <MessageSquare size={28} />
        <AnimatePresence>
            {unreadCount > 0 && (
                <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 bg-danger text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                >
                    {unreadCount}
                </motion.span>
            )}
        </AnimatePresence>
    </motion.button>
);

const ChatWindow: React.FC<{ onClose: () => void; isOpen: boolean }> = ({ onClose, isOpen }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[600px] bg-white dark:bg-neutral-800 rounded-2xl shadow-popover flex flex-col overflow-hidden border border-black/10 dark:border-white/10 p-4"
        >
            <CustomerChatView onClose={onClose} />
        </motion.div>
    );
};

const LiveChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { customerUnreadCount } = useLiveChat();
    const [showProactive, setShowProactive] = useState(false);
    const [proactiveDismissed, setProactiveDismissed] = useState(sessionStorage.getItem('dineos-proactive-seen') === 'true');

    useEffect(() => {
        if (!isOpen && !proactiveDismissed) {
            const timer = setTimeout(() => {
                setShowProactive(true);
            }, 8000); // 8 seconds
            return () => clearTimeout(timer);
        }
    }, [isOpen, proactiveDismissed]);

    const handleOpenChat = () => {
        setIsOpen(true);
        if (showProactive) {
            setShowProactive(false);
        }
        if (!proactiveDismissed) {
            sessionStorage.setItem('dineos-proactive-seen', 'true');
            setProactiveDismissed(true);
        }
    };

    const handleDismissProactive = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowProactive(false);
        if (!proactiveDismissed) {
            sessionStorage.setItem('dineos-proactive-seen', 'true');
            setProactiveDismissed(true);
        }
    };

    return (
        <>
            <AnimatePresence>
                {showProactive && <ProactiveBubble onDismiss={handleDismissProactive} />}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen ? (
                     <motion.button
                        onClick={() => setIsOpen(false)}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-neutral-700 rounded-full text-white flex items-center justify-center shadow-lg"
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        exit={{ rotate: -90, scale: 0 }}
                        aria-label="Tutup live chat"
                    >
                        <X size={28} />
                    </motion.button>
                ) : (
                    <ChatBubble onClick={handleOpenChat} unreadCount={customerUnreadCount} />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isOpen && <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    );
};

export default LiveChatWidget;