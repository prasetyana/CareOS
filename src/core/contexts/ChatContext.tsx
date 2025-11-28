import React, { createContext, useState, ReactNode } from 'react';

interface ChatContextType {
    isChatOpen: boolean;
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => setIsChatOpen(prev => !prev);
    const openChat = () => {
        setIsChatOpen(true);
        // Dispatch event to close other panels
        window.dispatchEvent(new CustomEvent('closeOtherPanels', { detail: 'chat' }));
    };
    const closeChat = () => setIsChatOpen(false);

    return (
        <ChatContext.Provider value={{ isChatOpen, toggleChat, openChat, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = React.useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
