import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

interface DashboardHeaderProps {
    title: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title }) => {
    const { mode, toggleMode } = useTheme();
    const { user } = useAuth();
    
    return (
        <header className="sticky top-8 z-20">
            <div className="flex h-20 items-center justify-between rounded-2xl bg-surface/90 p-6 backdrop-blur-xl border border-glass-border shadow-popover">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input 
                            type="text"
                            placeholder="Cari menu..."
                            className="w-full max-w-xs rounded-lg border-none bg-black/5 dark:bg-white/5 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <button
                        onClick={toggleMode}
                        className="p-2.5 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="Toggle light/dark mode"
                    >
                        {mode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                     <button
                        className="p-2.5 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 relative"
                        aria-label="Notifikasi"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-danger ring-2 ring-surface-2"></span>
                    </button>
                    {user && (
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;