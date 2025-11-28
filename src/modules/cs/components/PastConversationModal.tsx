import React from 'react';
import { Conversation } from '@core/data/mockDB';
import Modal from '@ui/Modal';
import ChatBubble from './ChatBubble';

const PastConversationModal: React.FC<{ conversation: Conversation | null; onClose: () => void; }> = ({ conversation, onClose }) => {
    if (!conversation) return null;

    const firstMessageDate = new Date(conversation.messages[0]?.timestamp || Date.now());

    return (
        <Modal isOpen={!!conversation} onClose={onClose} title={`Riwayat Chat: ${conversation.customerName}`}>
            <div className="flex flex-col h-[70vh]">
                <div className="pb-4 border-b border-black/10 dark:border-white/10 mb-4">
                    <p className="text-sm text-text-muted">
                        Percakapan pada <span className="font-semibold text-text-primary">{firstMessageDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                    <p className="text-xs text-text-muted">
                        Status: <span className={`font-medium ${conversation.status === 'closed' ? 'text-danger' : 'text-success'}`}>{conversation.status === 'closed' ? 'Ditutup' : 'Terbuka'}</span>
                    </p>
                </div>

                <div className="flex-grow p-4 -mx-4 space-y-4 overflow-y-auto bg-neutral-50 dark:bg-neutral-800/50 custom-scrollbar">
                    {conversation.messages.map(msg => (
                        <ChatBubble key={msg.id} message={msg} />
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default PastConversationModal;
