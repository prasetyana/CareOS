import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ThumbsUp, ThumbsDown, Smile, CheckCheck, ArrowLeft, MessageSquarePlus, Star, Paperclip, Camera, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth } from '@core/hooks/useAuth';
import { useLiveChat } from '@core/contexts/LiveChatContext';
import CustomerChatBubble from './CustomerChatBubble';
import TypingIndicator from '@ui/TypingIndicator';
import { useClickOutside } from '@core/hooks/useClickOutside';
import { Conversation, Message } from '@core/data/mockDB';
import { useToast } from '@core/hooks/useToast';
import Modal from '@ui/Modal';

const emojis = ['😊', '😂', '👍', '❤️', '🙏', '🎉', '🤔', '😢'];
const chatTopics = ['Pertanyaan Umum', 'Status Pesanan', 'Reservasi', 'Lainnya'];

const ReadReceipt: React.FC<{ conversation: Conversation | null }> = ({ conversation }) => {
    if (!conversation) return null;
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (lastMessage && lastMessage.sender.type === 'customer' && lastMessage.read) {
        return (
            <div className="flex justify-end mt-1 pr-2">
                <CheckCheck size={16} className="text-accent" />
            </div>
        );
    }
    return null;
}

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


const ConversationListItem: React.FC<{ conversation: Conversation; onSelect: () => void }> = ({ conversation, onSelect }) => {
    const lastMessage = conversation.messages.filter(m => m.type === 'public').slice(-1)[0];
    const isClosed = conversation.status === 'closed';
    const hasUnread = conversation.messages.some(m => m.sender.type === 'agent' && !m.read && m.type === 'public');

    return (
        <button
            onClick={onSelect}
            className={`w-full text-left p-3 rounded-lg transition-colors ${isClosed ? 'opacity-60' : ''} ${hasUnread ? 'bg-accent/10' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
        >
            <div className="flex justify-between items-center">
                <h4 className={`font-medium text-sm truncate ${isClosed ? 'text-text-muted' : 'text-text-primary'}`}>
                    Percakapan #{conversation.id}
                </h4>
                <p className="text-xs text-text-muted flex-shrink-0 ml-2">
                    {lastMessage ? new Date(lastMessage.timestamp).toLocaleDateString('id-ID') : ''}
                </p>
            </div>
            <div className="h-4 mt-0.5 flex items-center">
                {hasUnread && <span className="w-2 h-2 bg-accent rounded-full mr-2"></span>}
                <p className={`text-xs truncate ${hasUnread ? 'text-accent font-medium' : 'text-text-muted'}`}>
                    {lastMessage?.text || 'Percakapan dimulai'}
                </p>
            </div>
        </button>
    );
};


interface CustomerChatViewProps {
    onClose?: () => void;
}

const CustomerChatView: React.FC<CustomerChatViewProps> = ({ onClose }) => {
    const { user } = useAuth();
    const {
        customerConversations,
        activeCustomerConversation,
        setActiveCustomerConversation,
        sendMessage,
        startNewConversation,
        startTyping,
        stopTyping,
        reopenConversation,
        rateConversation,
        markAgentMessagesAsRead
    } = useLiveChat();
    const { addToast } = useToast();

    const [view, setView] = useState<'list' | 'chat' | 'new'>('list');
    const [preChatData, setPreChatData] = useState({ topic: 'Pertanyaan Umum', message: '' });
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [csatRating, setCsatRating] = useState(0);
    const [csatHoverRating, setCsatHoverRating] = useState(0);
    const [csatComment, setCsatComment] = useState('');

    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));

    useEffect(() => {
        if (activeCustomerConversation) {
            setView('chat');
        }
    }, [activeCustomerConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeCustomerConversation?.messages, activeCustomerConversation?.typing.agent]);

    useEffect(() => {
        if (view === 'chat' && activeCustomerConversation) {
            const hasUnread = activeCustomerConversation.messages.some(m => m.sender.type === 'agent' && !m.read);
            if (hasUnread) {
                const timer = setTimeout(() => {
                    markAgentMessagesAsRead(activeCustomerConversation.id);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [view, activeCustomerConversation, markAgentMessagesAsRead]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (isCameraOpen) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                    addToast('Tidak bisa mengakses kamera.', 'error');
                    setIsCameraOpen(false);
                });
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isCameraOpen, addToast]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setAttachmentPreview(dataUrl);
            setIsCameraOpen(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAttachmentPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else if (file) {
            addToast('Hanya file gambar yang didukung.', 'error');
        }
        // Reset file input value to allow selecting the same file again
        if (e.target) e.target.value = '';
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const textToSend = message.trim();
        if ((textToSend || attachmentPreview) && user) {
            if (activeCustomerConversation) {
                if (activeCustomerConversation.status === 'closed') {
                    reopenConversation(activeCustomerConversation.id);
                }
                const content = {
                    text: textToSend,
                    attachment: attachmentPreview ? { type: 'image' as const, url: attachmentPreview } : undefined
                };
                sendMessage(activeCustomerConversation.id, content, { id: user.id, name: user.name, type: 'customer' });
            }
            setMessage('');
            setAttachmentPreview(null);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (activeCustomerConversation) stopTyping(activeCustomerConversation.id, 'customer');
        }
    };

    const handleStartNew = async (e: React.FormEvent) => {
        e.preventDefault();
        const textToSend = preChatData.message.trim();
        if (textToSend && user) {
            await startNewConversation(preChatData);
            setPreChatData({ topic: 'Pertanyaan Umum', message: '' });
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessage(value);
        if (activeCustomerConversation && activeCustomerConversation.status === 'open') {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            startTyping(activeCustomerConversation.id, 'customer', value);
            typingTimeoutRef.current = window.setTimeout(() => {
                stopTyping(activeCustomerConversation.id, 'customer');
            }, 2000);
        }
    };

    const handleRateConversation = () => {
        if (activeCustomerConversation && csatRating > 0) {
            rateConversation(activeCustomerConversation.id, csatRating, csatComment);
        }
    };

    const isClosed = activeCustomerConversation?.status === 'closed';
    const hasRated = !!activeCustomerConversation?.csat;
    const isOutOfOffice = activeCustomerConversation?.messages.some(m => m.text?.includes('di luar jam operasional'));

    const renderHeader = () => {
        let title = "Bantuan";
        if (view === 'list') title = "Percakapan Saya";
        if (view === 'new') title = "Percakapan Baru";

        return (
            <header className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 mb-4">
                <div className="flex items-center gap-2">
                    {(view === 'chat' || view === 'new') && (
                        <button onClick={() => { setView('list'); setActiveCustomerConversation(null); }} className="p-2 -ml-2 text-text-muted hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        {view === 'list' && <MessageSquare className="w-5 h-5" />}
                        <div>
                            <h3 className="font-semibold tracking-tight text-text-primary">{title}</h3>
                            {view === 'chat' && (
                                <p className="text-xs text-success flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-success rounded-full"></span>
                                    Online
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                )}
            </header>
        );
    };

    return (
        <>
            {renderHeader()}

            {view === 'list' && (
                <div className="flex-grow flex flex-col pt-4 overflow-hidden">
                    <button onClick={() => setView('new')} className="w-full flex items-center justify-center gap-2 mb-4 p-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-opacity-90 transition-opacity">
                        <MessageSquarePlus size={16} /> Mulai Percakapan Baru
                    </button>
                    <div className="flex-grow overflow-y-auto -mx-1 px-1 custom-scrollbar space-y-1">
                        {customerConversations.length > 0 && customerConversations.map(convo => (
                            <ConversationListItem key={convo.id} conversation={convo} onSelect={() => setActiveCustomerConversation(convo.id)} />
                        ))}
                    </div>
                </div>
            )}

            {view === 'new' && (
                <div className="flex-grow flex flex-col pt-4">
                    <form onSubmit={handleStartNew} className="flex-grow flex flex-col">
                        <div className="space-y-5">
                            <div>
                                <label className="text-[13px] font-medium text-text-muted dark:text-gray-400 mb-2.5 block">Topik</label>
                                <div className="relative">
                                    <select
                                        value={preChatData.topic}
                                        onChange={(e) => setPreChatData(prev => ({ ...prev, topic: e.target.value }))}
                                        className="w-full bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 pr-10 text-[15px] text-text-primary dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all appearance-none"
                                    >
                                        {chatTopics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-text-muted dark:text-gray-400 mb-2.5 block">Pesan</label>
                                <textarea
                                    value={preChatData.message}
                                    onChange={(e) => setPreChatData(prev => ({ ...prev, message: e.target.value }))}
                                    placeholder="Ketik pesan pertama Anda..."
                                    className="w-full bg-white/60 dark:bg-black/30 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-xl p-4 text-[15px] text-text-primary dark:text-gray-100 placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all resize-none"
                                    autoFocus
                                    rows={5}
                                />
                            </div>
                        </div>
                        <button type="submit" className="mt-auto w-full p-3.5 rounded-xl bg-accent text-white text-[15px] font-medium text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed" disabled={!preChatData.message.trim()}>
                            Mulai Chat
                        </button>
                    </form>
                </div>
            )}

            {view === 'chat' && activeCustomerConversation && (
                <>
                    <div className="flex-grow p-4 -mx-4 space-y-4 overflow-y-auto custom-scrollbar">
                        {isOutOfOffice && (
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs text-center rounded-lg my-2">
                                Jam operasional kami adalah 09:00 - 21:00. Kami akan segera merespons saat kembali online.
                            </div>
                        )}
                        {activeCustomerConversation.messages
                            .filter(msg => msg.type !== 'internal')
                            .map((msg, index) => {
                                const prevMsg = activeCustomerConversation.messages[index - 1];
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
                                        <CustomerChatBubble message={msg} />
                                    </React.Fragment>
                                );
                            })}
                        {activeCustomerConversation.typing.agent && <TypingIndicator />}
                        <ReadReceipt conversation={activeCustomerConversation} />
                        <div ref={messagesEndRef} />
                    </div>
                    <footer className="pt-4 border-t border-black/10 dark:border-white/10 relative">
                        {isClosed && (
                            <div className="mb-3 text-center text-sm">
                                {!hasRated ? (
                                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                                        <p className="font-medium mb-2 text-text-muted">Bagaimana pengalaman Anda?</p>
                                        <div className="flex justify-center gap-2 mb-3" onMouseLeave={() => setCsatHoverRating(0)}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button key={star} onClick={() => setCsatRating(star)} onMouseEnter={() => setCsatHoverRating(star)}>
                                                    <Star className={`w-6 h-6 transition-colors ${star <= (csatHoverRating || csatRating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                                </button>
                                            ))}
                                        </div>
                                        {csatRating > 0 && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    value={csatComment}
                                                    onChange={e => setCsatComment(e.target.value)}
                                                    placeholder="Berikan komentar (opsional)..."
                                                    className="flex-grow bg-white dark:bg-neutral-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent border border-black/10 dark:border-white/10"
                                                />
                                                <button onClick={handleRateConversation} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white">Kirim</button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-xs text-text-muted">Terima kasih atas feedback Anda! Kirim pesan untuk memulai percakapan baru.</p>
                                        <div className="text-center mt-2">
                                            <button
                                                onClick={() => addToast('Salinan percakapan telah dikirim ke email Anda.', 'success')}
                                                className="text-xs text-text-muted hover:underline"
                                            >
                                                Kirim Salinan Chat ke Email
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                        {showEmojiPicker && (
                            <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 bg-white dark:bg-neutral-700 p-2 rounded-lg shadow-popover grid grid-cols-4 gap-2">
                                {emojis.map(emoji => (<button key={emoji} onClick={() => setMessage(prev => prev + emoji)} className="p-2 text-2xl rounded-lg hover:bg-black/5 dark:hover:bg-white/10">{emoji}</button>))}
                            </div>
                        )}
                        {attachmentPreview && (
                            <div className="relative w-20 h-20 mb-2 p-1 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
                                <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover rounded" />
                                <button onClick={() => setAttachmentPreview(null)} className="absolute -top-2 -right-2 bg-neutral-600 text-white rounded-full p-0.5 shadow-md">
                                    <X size={14} />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-text-muted hover:text-accent"><Paperclip className="w-5 h-5" /></button>
                            <button type="button" onClick={() => setIsCameraOpen(true)} className="p-2 text-text-muted hover:text-accent"><Camera className="w-5 h-5" /></button>
                            <div className="relative flex-grow">
                                <input type="text" value={message} onChange={handleTyping} placeholder={isClosed ? "Kirim pesan untuk memulai lagi..." : "Ketik pesan..."} className="w-full bg-black/5 dark:bg-white/5 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent border-transparent" />
                                <button type="button" onClick={() => setShowEmojiPicker(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-accent"><Smile className="w-5 h-5" /></button>
                            </div>
                            <button type="submit" className="p-2 bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50" disabled={!message.trim() && !attachmentPreview}><Send className="w-5 h-5" /></button>
                        </form>
                    </footer>
                </>
            )}

            <Modal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} title="Ambil Gambar">
                <div className="space-y-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <button onClick={handleCapture} className="w-full p-3 rounded-xl bg-accent text-white font-medium text-center hover:opacity-90">Ambil Gambar</button>
                </div>
            </Modal>
        </>
    );
};

export default CustomerChatView;