import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, fetchMenuItems } from '@core/data/mockDB';
import { useTenantParam } from '@core/hooks/useTenantParam';

interface SpotlightSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const SpotlightSearch: React.FC<SpotlightSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<MenuItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const navigate = useNavigate();
    const { withTenant } = useTenantParam();

    useEffect(() => {
        const loadItems = async () => {
            const data = await fetchMenuItems();
            setItems(data);
        };
        loadItems();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setFilteredItems([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = items.filter(item =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 5); // Limit to 5 results

        setFilteredItems(results);
        setSelectedIndex(0);
    }, [query, items]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
                handleSelect(filteredItems[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (item: MenuItem) => {
        navigate(withTenant(`/account/menu/${item.slug}`));
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[10000] px-4"
                    >
                        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col">
                            {/* Input Area */}
                            <div className="flex items-center px-4 py-4 border-b border-neutral-200/50 dark:border-neutral-700/50">
                                <Search className="w-6 h-6 text-neutral-400 mr-3" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Cari menu, kategori, atau promo..."
                                    className="flex-1 bg-transparent border-none outline-none text-xl text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400"
                                    autoComplete="off"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onClose}
                                        className="p-1 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 rounded-md transition-colors"
                                    >
                                        <span className="text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">ESC</span>
                                    </button>
                                </div>
                            </div>

                            {/* Results Area */}
                            {query && (
                                <div className="max-h-[400px] overflow-y-auto p-2">
                                    {filteredItems.length > 0 ? (
                                        <ul ref={listRef} className="space-y-1">
                                            {filteredItems.map((item, index) => (
                                                <li key={item.id}>
                                                    <button
                                                        onClick={() => handleSelect(item)}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${index === selectedIndex
                                                            ? 'bg-blue-500 text-white shadow-md'
                                                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                                                            }`}
                                                    >
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-12 h-12 rounded-lg object-cover bg-neutral-200"
                                                        />
                                                        <div className="flex-1 text-left min-w-0">
                                                            <h4 className={`font-medium ${index === selectedIndex ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                                                                {item.name}
                                                            </h4>
                                                            <p className={`text-sm truncate ${index === selectedIndex ? 'text-blue-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className={`text-sm font-semibold mr-3 ${index === selectedIndex ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                                                                {item.price}
                                                            </span>
                                                            {index === selectedIndex && (
                                                                <ArrowRight className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                                            <p>Tidak ada hasil untuk "{query}"</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer / Hints */}
                            {!query && (
                                <div className="px-6 py-8 text-center text-neutral-400 dark:text-neutral-500">
                                    <div className="flex justify-center mb-4">
                                        <Command className="w-12 h-12 opacity-20" />
                                    </div>
                                    <p className="text-sm">Ketik untuk mulai mencari...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default SpotlightSearch;
