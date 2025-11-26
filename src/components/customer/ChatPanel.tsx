
import React from 'react';
import { useChat } from '../../hooks/useChat';
import CustomerChatView from './CustomerChatView';

const ChatPanel: React.FC = () => {
    const { closeChat } = useChat();

    return (
        <aside className="h-full w-full rounded-3xl bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-xl border border-white/40 dark:border-neutral-700/40 shadow-2xl shadow-black/10 p-3.5 flex flex-col font-sans">
            <CustomerChatView onClose={closeChat} />
        </aside>
    );
};

export default ChatPanel;