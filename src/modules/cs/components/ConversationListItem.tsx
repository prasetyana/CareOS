import React, { useState, useEffect } from 'react';
import { Conversation, mockUsers } from '@core/data/mockDB';
import TypingIndicator from '@ui/TypingIndicator';
import { ThumbsDown, ThumbsUp, Clock } from 'lucide-react';

interface ConversationListItemProps {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, isActive, onClick }) => {
    const lastMessage = conversation.messages.filter(m => m.type === 'public').slice(-1)[0];
    const isClosed = conversation.status === 'closed';
    const needsAttention = conversation.requiresHuman && conversation.status === 'open';
    const assignee = conversation.assigneeId ? mockUsers.find(u => u.id === conversation.assigneeId) : null;
    const [waitingTime, setWaitingTime] = useState<number | null>(null);

    useEffect(() => {
        const lastCustomerMessage = [...conversation.messages].reverse().find(m => m.sender.type === 'customer' && m.type === 'public');

        if (!lastCustomerMessage || conversation.status !== 'open' || (assignee && conversation.messages.slice(-1)[0]?.sender.id === assignee.id)) {
            setWaitingTime(null);
            return;
        }

        const calculateTime = () => {
            const now = new Date();
            const messageDate = new Date(lastCustomerMessage.timestamp);
            const diffSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);
            setWaitingTime(diffSeconds);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);

    }, [conversation.messages, conversation.status, assignee]);

    const formatSlaTime = (seconds: number | null): string => {
        if (seconds === null) return '';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const getSlaColor = (seconds: number | null): string => {
        if (seconds === null) return 'text-text-muted';
        if (seconds > 5 * 60) return 'text-danger'; // > 5 mins
        if (seconds > 2 * 60) return 'text-yellow-500'; // > 2 mins
        return 'text-success';
    };

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-3 rounded-lg transition-colors relative ${isActive ? 'bg-accent/10' : 'hover:bg-black/5 dark:hover:bg-white/5'} ${isClosed && !isActive ? 'opacity-60' : ''} ${needsAttention && !isActive ? 'bg-red-500/10 hover:bg-red-500/20' : ''}`}
        >
            <div className="flex justify-between items-center">
                <h4 className={`font-semibold text-sm truncate ${isClosed ? 'text-text-muted' : 'text-text-primary'}`}>{conversation.customerName}</h4>
                {isClosed && conversation.csat ? (
                    <div className={`flex items-center gap-1 text-xs font-bold ${conversation.csat.rating >= 4 ? 'text-green-500' : 'text-red-500'}`}>
                        {conversation.csat.rating} ★
                    </div>
                ) : waitingTime !== null ? (
                    <div className={`flex items-center gap-1 text-xs font-semibold tabular-nums ${getSlaColor(waitingTime)}`}>
                        <Clock size={12} />
                        {formatSlaTime(waitingTime)}
                    </div>
                ) : (
                    <p className="text-xs text-text-muted flex-shrink-0 ml-2">{lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                )}
            </div>
            <div className="mt-1 space-y-1">
                <div className="h-4">
                    {needsAttention ? (
                        <span className="text-xs text-red-600 dark:text-red-400 font-semibold italic">Butuh bantuan agen</span>
                    ) : conversation.typing.customer ? (
                        <span className="text-xs text-accent italic">sedang mengetik...</span>
                    ) : (
                        <p className="text-xs text-text-muted truncate">{lastMessage?.text || 'Percakapan dimulai'}</p>
                    )}
                </div>
                {conversation.tags && conversation.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {conversation.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium bg-black/5 dark:bg-white/10 text-text-muted rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {assignee && (
                <div
                    className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold border border-white/50"
                    title={`Ditugaskan ke ${assignee.name}`}
                >
                    {assignee.name.charAt(0)}
                </div>
            )}
            {conversation.unreadCount > 0 && !isClosed && !needsAttention && (
                <div className="absolute right-3 top-3 w-2 h-2 bg-accent rounded-full"></div>
            )}
            {needsAttention && (
                <div className="absolute right-3 top-3.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                </div>
            )}
        </button>
    );
};

export default ConversationListItem;
