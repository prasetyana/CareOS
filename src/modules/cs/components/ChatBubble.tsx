import React from 'react';
import { Message } from '../../data/mockDB';

interface ChatBubbleProps {
    message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const isAgent = message.sender.type === 'agent';
    const isSystem = message.sender.type === 'system';

    if (isSystem) {
        return (
            <div className="text-center my-2">
                <span className="text-xs text-text-muted bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full">{message.text}</span>
            </div>
        )
    }
    
    if (message.type === 'internal') {
        return (
            <div className="my-2 mx-auto max-w-[90%]">
                <div className="bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/50">
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Internal Note by {message.sender.name}</p>
                    <p className="text-sm text-yellow-900 dark:text-yellow-200 whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 text-right mt-1">{new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`flex items-end gap-2 group ${isAgent ? 'justify-end' : 'justify-start'}`}>
             {!isAgent && (
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-600 flex-shrink-0 flex items-center justify-center font-bold text-sm text-neutral-500">
                    {message.sender.name.charAt(0)}
                </div>
            )}
            <div className="flex flex-col" style={{ alignItems: isAgent ? 'flex-end' : 'flex-start' }}>
                <div
                    className={`max-w-full rounded-2xl ${isAgent
                        ? 'bg-accent text-white rounded-br-none'
                        : 'bg-white dark:bg-neutral-700 rounded-bl-none shadow-sm'
                        } ${message.attachment ? 'p-1.5' : 'p-3'}`}
                >
                    {message.attachment && message.attachment.type === 'image' && (
                        <a href={message.attachment.url} target="_blank" rel="noopener noreferrer">
                            <img 
                                src={message.attachment.url} 
                                alt="Attachment"
                                className="rounded-lg max-w-full h-auto max-h-48 cursor-pointer"
                            />
                        </a>
                    )}
                    {message.text && (
                        <p className={`text-sm whitespace-pre-wrap ${message.attachment ? 'p-2' : ''}`}>{message.text}</p>
                    )}
                </div>
                <p className="text-xs text-text-muted mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

export default ChatBubble;
