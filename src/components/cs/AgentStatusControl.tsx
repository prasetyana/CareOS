import React, { useState, useRef } from 'react';
import { useLiveChat, AgentStatus } from '../../contexts/LiveChatContext';
import { useAuth } from '../../hooks/useAuth';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';

const statusOptions: { status: AgentStatus; label: string; color: string }[] = [
    { status: 'online', label: 'Online', color: 'bg-success' },
    { status: 'away', label: 'Away', color: 'bg-yellow-500' },
    { status: 'offline', label: 'Offline', color: 'bg-gray-400' },
];

const AgentStatusControl: React.FC = () => {
    const { user } = useAuth();
    const { agentStatus, setAgentStatus } = useLiveChat();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setIsOpen(false));

    if (!user) return null;

    const currentStatus = agentStatus[user.id] || 'online';
    const currentStatusInfo = statusOptions.find(s => s.status === currentStatus)!;

    const handleStatusChange = (status: AgentStatus) => {
        setAgentStatus(user.id, status);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button 
                onClick={() => setIsOpen(p => !p)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 w-full text-left"
            >
                <span className={`w-2.5 h-2.5 rounded-full ${currentStatusInfo.color}`}></span>
                <span className="text-sm font-medium text-text-muted flex-grow capitalize">{currentStatusInfo.label}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-neutral-700 rounded-lg shadow-popover border border-black/10 dark:border-white/10 p-1 z-10 animate-scale-in" style={{transformOrigin: 'bottom left'}}>
                    {statusOptions.map(option => (
                        <button
                            key={option.status}
                            onClick={() => handleStatusChange(option.status)}
                            className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-text-primary dark:text-gray-200"
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${option.color}`}></span>
                            <span className="capitalize">{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AgentStatusControl;