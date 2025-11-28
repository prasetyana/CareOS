import React, { useState, useEffect } from 'react';
import { User, Order, Conversation, CustomerActivity, mockUsers, fetchOrdersByCustomerId, fetchConversationsByCustomerId, fetchCustomerActivityByCustomerId, fetchKnowledgeBase, KnowledgeBaseItem } from '@core/data/mockDB';
import { useLiveChat } from '@core/contexts/LiveChatContext';
import { User as UserIcon, Monitor, Smartphone, X, Plus, Send } from 'lucide-react';
import CustomerJourneyTimeline from './CustomerJourneyTimeline';
import PastConversationModal from './PastConversationModal';
import MergeConversationModal from './MergeConversationModal';

const getLoyaltyTier = (points: number) => {
    if (points >= 1000) return { name: 'Gold', color: 'text-amber-400' };
    if (points >= 500) return { name: 'Silver', color: 'text-slate-400' };
    return { name: 'Bronze', color: 'text-orange-400' };
};

const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const statusClasses = {
        'Selesai': 'bg-success/10 text-success',
        'Diproses': 'bg-accent/10 text-accent',
        'Dibatalkan': 'bg-danger/10 text-danger',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>;
};

interface CustomerDetailsPanelProps {
    conversation: Conversation | null;
    onInsertText: (text: string) => void;
}

const CustomerDetailsPanel: React.FC<CustomerDetailsPanelProps> = ({ conversation, onInsertText }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [pastConversations, setPastConversations] = useState<Conversation[]>([]);
    const [activities, setActivities] = useState<CustomerActivity[]>([]);
    const [selectedPastConversation, setSelectedPastConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(false);
    const [customer, setCustomer] = useState<User | null>(null);
    const { addTagToConversation, removeTagFromConversation, assignConversation, agentStatus, mergeConversations } = useLiveChat();
    const [newTag, setNewTag] = useState('');
    const [activeTab, setActiveTab] = useState<'details' | 'kb'>('details');
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

    const agents = mockUsers.filter(u => u.role === 'cs' || u.role === 'admin');

    useEffect(() => {
        if (conversation) {
            setLoading(true);
            const loadData = async () => {
                const customerData = mockUsers.find(u => u.id === conversation.customerId);
                const [orderData, conversationHistory, activityData] = await Promise.all([
                    fetchOrdersByCustomerId(conversation.customerId),
                    fetchConversationsByCustomerId(conversation.customerId),
                    fetchCustomerActivityByCustomerId(conversation.customerId)
                ]);
                setCustomer(customerData || null);
                setOrders(orderData);
                setPastConversations(conversationHistory.filter(c => c.id !== conversation.id));
                setActivities(activityData);
                setLoading(false);
            }
            loadData();
        } else {
            setCustomer(null);
            setOrders([]);
            setPastConversations([]);
            setActivities([]);
        }
    }, [conversation]);

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTag.trim() && conversation) {
            addTagToConversation(conversation.id, newTag.trim());
            setNewTag('');
        }
    };

    const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (conversation) {
            const agentId = e.target.value ? parseInt(e.target.value) : null;
            assignConversation(conversation.id, agentId);
        }
    };

    const handleMergeConfirm = (secondaryId: number) => {
        if (conversation) {
            mergeConversations(conversation.id, secondaryId);
        }
        setIsMergeModalOpen(false);
    };

    if (!conversation) {
        return (
            <div className="h-full flex items-center justify-center text-center p-4 text-text-muted">
                <div>
                    <UserIcon size={48} className="mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
                    <p className="font-medium">Detail Pelanggan</p>
                    <p className="text-sm">Pilih percakapan untuk melihat informasi pelanggan.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 mb-2"></div>
                    <div className="h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
                </div>
                <div className="space-y-2 pt-4">
                    <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="h-full flex items-center justify-center text-center p-4 text-text-muted">
                <p>Data pelanggan tidak ditemukan.</p>
            </div>
        );
    }

    const loyalty = getLoyaltyTier(customer.loyaltyPoints);

    const DetailsTab: React.FC = () => (
        <>
            {/* Customer Stats */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-black/10 dark:border-white/10 text-center">
                <div>
                    <p className="text-xs text-text-muted">Loyalti</p>
                    <p className={`font-semibold ${loyalty.color}`}>{loyalty.name}</p>
                </div>
                <div>
                    <p className="text-xs text-text-muted">Total Pesanan</p>
                    <p className="font-semibold text-text-primary">{orders.length}</p>
                </div>
            </div>

            {/* Current Session */}
            {conversation.metadata && (
                <div className="py-4 border-b border-black/10 dark:border-white/10">
                    <h4 className="font-semibold text-sm text-text-primary mb-2">Sesi Saat Ini</h4>
                    <div className="space-y-2 text-xs text-text-muted">
                        <div className="flex items-center gap-2">
                            {conversation.metadata.device === 'Desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
                            <span>Di halaman: <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">{conversation.metadata.currentPage}</code></span>
                        </div>
                    </div>
                </div>
            )}

            {/* Assigned To Section */}
            <div className="py-4 border-b border-black/10 dark:border-white/10">
                <h4 className="font-semibold text-sm text-text-primary mb-2">Ditugaskan ke</h4>
                <select
                    value={conversation.assigneeId || ''}
                    onChange={handleAssign}
                    className="w-full bg-black/5 dark:bg-white/5 border-transparent rounded-md text-sm px-2 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
                >
                    <option value="">Tidak Ditugaskan</option>
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>
                            {agent.name} {agentStatus[agent.id] === 'online' ? ' (Online)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tags Section */}
            <div className="py-4 border-b border-black/10 dark:border-white/10">
                <h4 className="font-semibold text-sm text-text-primary mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                    {(conversation.tags || []).map(tag => (
                        <div key={tag} className="flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-2 py-1 rounded">
                            <span>{tag}</span>
                            <button onClick={() => removeTagFromConversation(conversation.id, tag)} className="hover:text-danger">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAddTag} className="flex gap-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Tambah tag..."
                        className="flex-grow bg-black/5 dark:bg-white/5 border-transparent rounded-md text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button type="submit" className="p-1 bg-black/5 dark:bg-white/5 rounded-md text-text-muted hover:text-accent">
                        <Plus size={16} />
                    </button>
                </form>
            </div>

            {/* Customer Journey */}
            <div className="py-4 border-b border-black/10 dark:border-white/10">
                <h4 className="font-semibold text-sm text-text-primary mb-2">Jejak Pelanggan</h4>
                <CustomerJourneyTimeline activities={activities} />
            </div>

            {/* Chat History */}
            <div className="py-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm text-text-primary">Riwayat Chat</h4>
                    {pastConversations.length > 0 && (
                        <button onClick={() => setIsMergeModalOpen(true)} className="text-xs font-medium text-accent hover:underline">
                            Gabungkan
                        </button>
                    )}
                </div>
                <div className="space-y-2">
                    {pastConversations.length > 0 ? (
                        pastConversations.slice(0, 2).map(convo => (
                            <button
                                key={convo.id}
                                onClick={() => setSelectedPastConversation(convo)}
                                className="w-full text-left p-2 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                <p className="font-semibold text-xs text-text-primary truncate">{convo.messages[0]?.text || 'Percakapan kosong'}</p>
                                <div className="flex justify-between items-center text-xs text-text-muted mt-1">
                                    <span>{new Date(convo.messages[0]?.timestamp || Date.now()).toLocaleDateString('id-ID')}</span>
                                    <span className={`capitalize font-medium ${convo.status === 'closed' ? 'text-danger' : 'text-success'}`}>{convo.status === 'closed' ? 'Ditutup' : 'Terbuka'}</span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-xs text-text-muted text-center py-2">Tidak ada riwayat chat lain.</p>
                    )}
                </div>
            </div>
        </>
    );

    const KnowledgeBaseTab: React.FC = () => {
        const [kbItems, setKbItems] = useState<KnowledgeBaseItem[]>([]);
        const [kbSearch, setKbSearch] = useState('');
        const [kbLoading, setKbLoading] = useState(true);

        useEffect(() => {
            fetchKnowledgeBase().then(items => {
                setKbItems(items);
                setKbLoading(false);
            });
        }, []);

        const filteredItems = kbItems.filter(item =>
            item.question.toLowerCase().includes(kbSearch.toLowerCase()) ||
            item.answer.toLowerCase().includes(kbSearch.toLowerCase())
        );

        return (
            <div className="flex flex-col h-full">
                <input
                    type="text"
                    value={kbSearch}
                    onChange={e => setKbSearch(e.target.value)}
                    placeholder="Cari jawaban..."
                    className="w-full bg-black/5 dark:bg-white/5 border-transparent rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent mb-3"
                />
                {kbLoading ? <p className="text-xs text-center text-text-muted">Memuat...</p> : (
                    <div className="flex-grow overflow-y-auto space-y-2 -mr-4 pr-4 custom-scrollbar">
                        {filteredItems.map(item => (
                            <div key={item.id} className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                                <p className="font-semibold text-xs text-text-primary">{item.question}</p>
                                <p className="text-xs text-text-muted mt-1">{item.answer}</p>
                                <button
                                    onClick={() => onInsertText(item.answer)}
                                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                                >
                                    <Send size={12} /> Kirim Jawaban
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Customer Header */}
            <div className="p-4 text-center border-b border-black/10 dark:border-white/10 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center font-bold text-2xl text-accent mx-auto mb-2">
                    {customer.name.charAt(0)}
                </div>
                <h3 className="font-bold text-text-primary">{customer.name}</h3>
                <p className="text-xs text-text-muted">{customer.email}</p>
            </div>

            {/* Tabs */}
            <div className="px-4 flex border-b border-black/10 dark:border-white/10 flex-shrink-0">
                <button onClick={() => setActiveTab('details')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'details' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'}`}>Detail</button>
                <button onClick={() => setActiveTab('kb')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === 'kb' ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-primary'}`}>Bantuan</button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                {activeTab === 'details' ? <DetailsTab /> : <KnowledgeBaseTab />}
            </div>

            <PastConversationModal
                conversation={selectedPastConversation}
                onClose={() => setSelectedPastConversation(null)}
            />
            <MergeConversationModal
                isOpen={isMergeModalOpen}
                onClose={() => setIsMergeModalOpen(false)}
                conversationsToMerge={pastConversations}
                onMergeConfirm={handleMergeConfirm}
            />
        </div>
    );
};

export default CustomerDetailsPanel;