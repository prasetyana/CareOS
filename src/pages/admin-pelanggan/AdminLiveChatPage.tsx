import React, { useState, useEffect, useRef } from 'react';
import { useLiveChat, AIAssistAction, ConversationFilter } from '../../contexts/LiveChatContext';
import { useAuth } from '../../hooks/useAuth';
import { Search, Send, Paperclip, MessageSquare, StickyNote, Sparkles, Loader2, FileText, MessageSquareText, Wand2, Smile, Zap, Clock } from 'lucide-react';
import CustomerDetailsPanel from '../../components/cs/CustomerDetailsPanel';
import CannedResponsesPopover from '../../components/cs/CannedResponsesPopover';
import TypingIndicator from '../../components/TypingIndicator';
import ConversationListItem from '../../components/cs/ConversationListItem';
import ChatBubble from '../../components/cs/ChatBubble';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Message, User, mockUsers } from '../../data/mockDB';
import SegmentedControl from '../../components/SegmentedControl';

const emojis = ['😊', '😂', '👍', '❤️', '🙏', '🎉', '🤔', '😢'];

const shouldShowDateSeparator = (currentMessage: Message, previousMessage: Message | undefined): boolean => {
    if (!previousMessage) return true;
    const currentDate = new Date(currentMessage.timestamp);
    const previousDate = new Date(previousMessage.timestamp);
    return currentDate.toDateString() !== previousDate.toDateString();
};

const formatDateSeparator = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hari Ini';
    if (date.toDateString() === yesterday.toDateString()) return 'Kemarin';
    return date.toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' });
};

const ReadReceipt: React.FC<{ conversation: import('../../data/mockDB').Conversation | null }> = ({ conversation }) => {
    if (!conversation) return null;
    
    const lastMessage = [...conversation.messages].reverse().find(m => m.sender.type === 'agent' && m.type === 'public');

    if (lastMessage && lastMessage.read) {
        return <p className="text-right text-xs text-text-muted mt-1 px-4">Dilihat oleh {conversation.customerName.split(' ')[0]}</p>;
    }
    return null;
}

const filterOptions = ['Semua Aktif', 'Punya Saya', 'Belum Ditugaskan', 'Ditunda', 'Ditutup'];
type FilterOption = 'Semua Aktif' | 'Punya Saya' | 'Belum Ditugaskan' | 'Ditunda' | 'Ditutup';

const filterMap: Record<FilterOption, ConversationFilter> = {
  'Semua Aktif': 'all',
  'Punya Saya': 'mine',
  'Belum Ditugaskan': 'unassigned',
  'Ditunda': 'snoozed',
  'Ditutup': 'closed',
};

const reverseFilterMap: Record<ConversationFilter, FilterOption> = {
  all: 'Semua Aktif',
  mine: 'Punya Saya',
  unassigned: 'Belum Ditugaskan',
  snoozed: 'Ditunda',
  closed: 'Ditutup',
};

const ViewingAgentsIndicator: React.FC<{ agentIds: number[]; currentUserId: number }> = ({ agentIds, currentUserId }) => {
    const viewingAgents = (agentIds || [])
        .filter(id => id !== currentUserId)
        .map(id => mockUsers.find(u => u.id === id))
        .filter((u): u is User => !!u);

    if (viewingAgents.length === 0) return null;

    const names = viewingAgents.map(u => u.name).join(', ');

    return (
        <div className="flex items-center group relative cursor-pointer" title={`Juga dilihat oleh ${names}`}>
            {viewingAgents.slice(0, 3).map((agent, index) => (
                <div 
                    key={agent.id}
                    className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-bold border-2 border-white dark:border-gray-800"
                    style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                >
                    {agent.name.charAt(0)}
                </div>
            ))}
            {viewingAgents.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 text-[10px] font-bold border-2 border-white dark:border-gray-800" style={{ marginLeft: '-8px' }}>
                    +{viewingAgents.length - 3}
                </div>
            )}
        </div>
    );
};


const AdminLiveChatPage: React.FC = () => {
    const { user } = useAuth();
    const { conversations, activeConversation, setActiveConversation, sendMessage, startTyping, stopTyping, closeConversation, getAIAssistance, isAIAssisting, snoozeConversation, activeFilter, setActiveFilter } = useLiveChat();
    const [message, setMessage] = useState('');
    const [mode, setMode] = useState<'reply' | 'note'>('reply');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [macroQuery, setMacroQuery] = useState('');
    const [showMacroPopover, setShowMacroPopover] = useState(false);

    const [isAIAssistOpen, setIsAIAssistOpen] = useState(false);
    const aiAssistRef = useRef<HTMLDivElement>(null);
    useClickOutside(aiAssistRef, () => setIsAIAssistOpen(false));

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));
    
    const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);
    const snoozeRef = useRef<HTMLDivElement>(null);
    useClickOutside(snoozeRef, () => setIsSnoozeOpen(false));

    const handleSnooze = (minutes: number) => {
        if (activeConversation) {
            const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
            snoozeConversation(activeConversation.id, snoozeUntil);
        }
        setIsSnoozeOpen(false);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages, activeConversation?.typing.customer]);
    
    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    const handleAutoResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(handleAutoResize, [message]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && user && activeConversation) {
            const messageType = mode === 'note' ? 'internal' : 'public';
            sendMessage(activeConversation.id, { text: message }, { id: user.id, name: user.name, type: 'agent' }, messageType);
            setMessage('');
            setShowMacroPopover(false);
        }
    };
    
    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setMessage(value);

        if (activeConversation) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            startTyping(activeConversation.id, 'agent');
            typingTimeoutRef.current = window.setTimeout(() => {
                stopTyping(activeConversation.id, 'agent');
            }, 2000);
        }

        const match = value.match(/\/(\w*)$/);
        if (match && mode === 'reply') {
            setShowMacroPopover(true);
            setMacroQuery(match[1]);
        } else {
            setShowMacroPopover(false);
        }
    };
    
    const handleSelectMacro = (text: string) => {
        setMessage(prev => prev.replace(/\/\w*$/, text));
        setShowMacroPopover(false);
        textareaRef.current?.focus();
    };

    const handleAIAssist = async (action: AIAssistAction) => {
        if (!activeConversation || isAIAssisting) return;

        setIsAIAssistOpen(false);
        const result = await getAIAssistance(action, activeConversation, message);
        
        if ((action === 'suggest' || action === 'improve') && typeof result === 'string') {
            setMessage(result);
            setTimeout(() => {
                textareaRef.current?.focus();
                handleAutoResize();
            }, 0);
        }
    };

    return (
        <div className="flex h-[calc(100vh-16rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Left Panel: Conversation List */}
            <div className="w-1/4 border-r border-black/10 dark:border-white/10 flex flex-col">
                <div className="p-4 border-b border-black/10 dark:border-white/10">
                     <SegmentedControl
                        id="chat-filter"
                        options={filterOptions}
                        value={reverseFilterMap[activeFilter]}
                        onChange={(val) => setActiveFilter(filterMap[val as FilterOption])}
                    />
                </div>
                <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
                     {conversations.length > 0 ? conversations.map(convo => (
                        <ConversationListItem
                            key={convo.id}
                            conversation={convo}
                            isActive={activeConversation?.id === convo.id}
                            onClick={() => setActiveConversation(convo.id)}
                        />
                    )) : (
                        <div className="text-center p-8 text-sm text-text-muted">
                            <p>Tidak ada percakapan di filter ini.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Panel: Active Conversation */}
            <div className="w-1/2 flex flex-col border-r border-black/10 dark:border-white/10">
                {activeConversation ? (
                    <>
                        <div className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-text-primary">{activeConversation.customerName}</h3>
                                <p className="text-xs text-success">Online</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {user && activeConversation.viewingAgents && (
                                    <ViewingAgentsIndicator agentIds={activeConversation.viewingAgents} currentUserId={user.id} />
                                )}
                                <div className="flex items-center gap-2">
                                    {activeConversation.status === 'open' && (
                                        <div ref={snoozeRef} className="relative">
                                            <button
                                                onClick={() => setIsSnoozeOpen(p => !p)}
                                                className="p-1.5 text-text-muted hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                                                title="Tunda percakapan"
                                            >
                                                <Clock size={16} />
                                            </button>
                                            {isSnoozeOpen && (
                                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-neutral-700 rounded-lg shadow-popover border border-black/10 dark:border-white/10 p-2 z-20 animate-scale-in" style={{transformOrigin: 'top right'}}>
                                                    <p className="px-2 py-1 text-xs font-semibold text-text-muted">Tunda hingga...</p>
                                                    <button onClick={() => handleSnooze(15)} className="w-full text-left p-2 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5">15 menit</button>
                                                    <button onClick={() => handleSnooze(60)} className="w-full text-left p-2 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5">1 jam</button>
                                                    <button onClick={() => handleSnooze(180)} className="w-full text-left p-2 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5">3 jam</button>
                                                    <button onClick={() => handleSnooze(24 * 60)} className="w-full text-left p-2 rounded text-sm hover:bg-black/5 dark:hover:bg-white/5">Besok</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {activeConversation.status === 'open' && (
                                        <button
                                            onClick={() => closeConversation(activeConversation.id)}
                                            className="px-3 py-1.5 text-xs font-semibold text-danger bg-danger/10 rounded-full hover:bg-danger/20 transition-colors"
                                        >
                                            Tutup Percakapan
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto bg-neutral-50 dark:bg-neutral-800/50 space-y-4 custom-scrollbar">
                            {activeConversation.messages.map((msg, index) => {
                                const prevMsg = activeConversation.messages[index-1];
                                const showSeparator = shouldShowDateSeparator(msg, prevMsg);
                                return (
                                    <React.Fragment key={msg.id}>
                                        {showSeparator && (
                                            <div className="text-center my-3">
                                                <span className="text-xs text-text-muted bg-black/5 dark:bg-white/10 px-2 py-1 rounded-full">
                                                    {formatDateSeparator(msg.timestamp)}
                                                </span>
                                            </div>
                                        )}
                                        <ChatBubble message={msg} />
                                    </React.Fragment>
                                );
                            })}
                            {activeConversation.typing.customer && !activeConversation.typing.customerPreview && <TypingIndicator />}
                            <ReadReceipt conversation={activeConversation} />
                            <div ref={messagesEndRef} />
                        </div>
                        {activeConversation.status === 'open' ? (
                            <div className="relative">
                                {activeConversation.typing.customer && activeConversation.typing.customerPreview && (
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 px-4 py-2 text-xs text-text-muted">
                                        <span className="font-semibold italic">Typing: </span>{activeConversation.typing.customerPreview}
                                    </div>
                                )}
                                <div className="p-4 border-t border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 relative">
                                    {showMacroPopover && (
                                        <CannedResponsesPopover
                                            filter={macroQuery}
                                            onSelect={handleSelectMacro}
                                            onClose={() => setShowMacroPopover(false)}
                                        />
                                    )}
                                    <div className="flex items-center gap-2 mb-2">
                                        <button onClick={() => setMode('reply')} className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${mode === 'reply' ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-black/5'}`}><MessageSquare size={14}/> Balas</button>
                                        <button onClick={() => setMode('note')} className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${mode === 'note' ? 'bg-yellow-400/20 text-yellow-600' : 'text-text-muted hover:bg-black/5'}`}><StickyNote size={14}/> Catatan</button>
                                    </div>
                                    <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                                         <div className="relative self-end" ref={aiAssistRef}>
                                            <button type="button" onClick={() => setIsAIAssistOpen(prev => !prev)} disabled={!activeConversation || isAIAssisting} className="p-2.5 text-text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed" aria-label="AI Assist">
                                                {isAIAssisting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                            </button>
                                            {isAIAssistOpen && (
                                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-neutral-700 rounded-lg shadow-popover border border-black/10 dark:border-white/10 p-2 z-20">
                                                    <button onClick={() => handleAIAssist('summarize')} className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-text-primary dark:text-gray-200">
                                                        <FileText size={16} /> Summarize Conversation
                                                    </button>
                                                    <button onClick={() => handleAIAssist('suggest')} className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-text-primary dark:text-gray-200">
                                                        <MessageSquareText size={16} /> Suggest Reply
                                                    </button>
                                                    <button onClick={() => handleAIAssist('improve')} disabled={!message.trim()} className="w-full text-left flex items-center gap-3 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-sm text-text-primary dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                                        <Wand2 size={16} /> Improve Writing
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button type="button" onClick={() => setShowMacroPopover(p => !p)} className="p-2.5 text-text-muted hover:text-accent"><Zap className="w-5 h-5" /></button>
                                        <button type="button" className="p-2.5 text-text-muted hover:text-accent"><Paperclip className="w-5 h-5" /></button>
                                        <div className="relative flex-grow">
                                            {showEmojiPicker && (
                                                <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 bg-white dark:bg-neutral-700 p-2 rounded-lg shadow-popover grid grid-cols-4 gap-2 z-20">
                                                    {emojis.map(emoji => (
                                                        <button key={emoji} type="button" onClick={() => setMessage(prev => prev + emoji)} className="p-2 text-2xl rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <textarea
                                                ref={textareaRef}
                                                rows={1}
                                                value={message}
                                                onChange={handleTyping}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage(e);
                                                    }
                                                }}
                                                placeholder={mode === 'reply' ? "Ketik balasan Anda... (coba ketik /)" : "Tambahkan catatan internal..."}
                                                className={`w-full border-transparent rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none max-h-24 custom-scrollbar transition-colors ${mode === 'note' ? 'bg-yellow-100/50 dark:bg-yellow-900/30' : 'bg-black/5 dark:bg-white/5'}`}
                                            />
                                            <button type="button" onClick={() => setShowEmojiPicker(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-accent">
                                                <Smile className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button type="submit" className={`p-2.5 rounded-lg text-white hover:opacity-90 disabled:opacity-50 transition-colors ${mode === 'note' ? 'bg-yellow-500' : 'bg-accent'}`} disabled={!message.trim()}>
                                            {mode === 'reply' ? <Send className="w-5 h-5" /> : <StickyNote className="w-5 h-5" />}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-text-muted bg-neutral-50 dark:bg-neutral-800/50 border-t border-black/10 dark:border-white/10">
                                Percakapan ini telah ditutup.
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-center text-text-muted">
                        <div>
                            <MessageSquare size={48} className="mx-auto mb-4 text-neutral-300 dark:text-neutral-600"/>
                            <p className="font-medium">Pilih percakapan untuk memulai.</p>
                            <p className="text-sm">Lihat detail pelanggan dan balas pesan di sini.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Customer Details */}
            <div className="w-1/4">
                <CustomerDetailsPanel conversation={activeConversation} onInsertText={setMessage} />
            </div>
        </div>
    );
};

export default AdminLiveChatPage;