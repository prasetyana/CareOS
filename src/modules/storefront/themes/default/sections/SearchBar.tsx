import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SpotlightSearch from '../../../customer/components/SpotlightSearch';

const SearchBar: React.FC = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Keyboard Shortcut for Search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div className="flex-1">
                <div
                    className="relative group cursor-pointer"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <div
                        className="w-full h-9 pl-10 pr-4 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center hover:bg-white/80 dark:hover:bg-black/50 hover:border-white/30 dark:hover:border-white/20 transition-all duration-200"
                        style={{
                            boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.06)',
                        }}
                    >
                        <span>Cari menu, promo, atau kategori...</span>
                        <div className="ml-auto flex items-center gap-1">
                            <span className="text-xs bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/5">⌘K</span>
                        </div>
                    </div>
                    <Search
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200"
                    />
                </div>
            </div>

            <SpotlightSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
};

export default SearchBar;
