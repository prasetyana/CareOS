import React from 'react';
import { Message } from '../../data/mockDB';
import { logoDataUri } from '../Logo';

interface CustomerChatBubbleProps {
    message: Message;
}

const CustomerChatBubble: React.FC<CustomerChatBubbleProps> = ({ message }) => {
    const isUser = message.sender.type === 'customer';
    return (
        <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                 <img src={logoDataUri} alt="DineOS Logo" className="h-6 w-6 text-neutral-800 flex-shrink-0" />
            )}
            <div
                className={`max-w-[80%] rounded-2xl ${isUser
                    ? 'bg-accent text-white rounded-br-none'
                    : 'bg-neutral-200 dark:bg-neutral-700 rounded-bl-none'
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
        </div>
    );
};

export default CustomerChatBubble;