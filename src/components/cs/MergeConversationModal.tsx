import React from 'react';
import { Conversation } from '../../data/mockDB';
import Modal from '../Modal';
import { Merge } from 'lucide-react';

interface MergeConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationsToMerge: Conversation[];
    onMergeConfirm: (secondaryConversationId: number) => void;
}

const MergeConversationModal: React.FC<MergeConversationModalProps> = ({ isOpen, onClose, conversationsToMerge, onMergeConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gabungkan Percakapan">
            <div className="flex flex-col h-[60vh]">
                <p className="text-sm text-text-muted mb-4">Pilih percakapan di bawah ini untuk digabungkan ke dalam percakapan saat ini. Pesan akan diurutkan berdasarkan waktu.</p>
                <div className="flex-grow overflow-y-auto -mx-6 px-6 custom-scrollbar space-y-2">
                    {conversationsToMerge.map(convo => (
                        <div key={convo.id} className="p-3 bg-black/5 dark:bg-white/10 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-xs text-text-primary truncate">{convo.messages[0]?.text || 'Percakapan kosong'}</p>
                                <div className="text-xs text-text-muted mt-1">
                                    <span>{new Date(convo.messages[0]?.timestamp || Date.now()).toLocaleDateString('id-ID')}</span>
                                    <span className="mx-2">•</span>
                                    <span className={`capitalize font-medium ${convo.status === 'closed' ? 'text-danger' : 'text-success'}`}>{convo.status === 'closed' ? 'Ditutup' : 'Terbuka'}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => onMergeConfirm(convo.id)}
                                className="flex-shrink-0 ml-4 px-3 py-1.5 text-xs font-semibold bg-accent text-white rounded-full hover:bg-opacity-90 transition-opacity"
                            >
                                Gabung
                            </button>
                        </div>
                    ))}
                </div>
                <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-sm font-medium text-text-muted bg-black/5 dark:bg-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MergeConversationModal;