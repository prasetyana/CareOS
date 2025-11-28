
import React, { useState, useEffect } from 'react';
import { useLiveChat } from '@core/contexts/LiveChatContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CannedResponsesPopoverProps {
    filter: string;
    onSelect: (text: string) => void;
    onClose: () => void;
}

const CannedResponsesPopover: React.FC<CannedResponsesPopoverProps> = ({ filter, onSelect, onClose }) => {
    const { cannedResponses } = useLiveChat();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const filteredResponses = cannedResponses.filter(r =>
        r.shortcut.toLowerCase().includes(filter.toLowerCase())
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [filter]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredResponses.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredResponses.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredResponses.length) % filteredResponses.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onSelect(filteredResponses[selectedIndex].text);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredResponses, selectedIndex, onSelect, onClose]);

    return (
        <AnimatePresence>
            {filteredResponses.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-700 rounded-lg shadow-popover border border-black/10 dark:border-white/10 overflow-hidden z-10 max-h-48 overflow-y-auto"
                >
                    <div className="p-2">
                        {filteredResponses.map((response, index) => (
                            <button
                                key={response.shortcut}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onSelect(response.text);
                                }}
                                className={`w-full text-left p-2 rounded text-sm flex justify-between items-center ${selectedIndex === index ? 'bg-accent/10 text-accent' : 'text-text-primary dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
                                    }`}
                            >
                                <div>
                                    <span className="font-semibold">/{response.shortcut}</span>
                                    <span className="text-text-muted ml-2 truncate">{response.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CannedResponsesPopover;
