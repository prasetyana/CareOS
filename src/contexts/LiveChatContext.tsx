import React, { createContext, useState, ReactNode, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { Conversation, Message, mockConversations, Sender, createNewConversation, CannedResponse, mockCannedResponses, mockUsers, fetchConversationsByCustomerId, Attachment, User, CSAT } from '../data/mockDB';
import { useAuth } from '../hooks/useAuth';
import { GoogleGenAI } from '@google/genai';
import { logoDataUri } from '../components/Logo';

export type AIAssistAction = 'summarize' | 'suggest' | 'improve';
export type AgentStatus = 'online' | 'away' | 'offline';
export type ConversationFilter = 'all' | 'mine' | 'unassigned' | 'closed' | 'snoozed';

interface AgentPerformance {
    agentId: number;
    agentName: string;
    chatsHandled: number;
    averageSatisfaction: number | null;
}

interface ChatAnalytics {
    totalChats: number;
    averageSatisfaction: number | null;
    averageFirstResponseTime: number | null; // seconds
    averageChatDuration: number | null; // seconds
    satisfactionDistribution: { star: number; count: number }[];
    agentPerformance: AgentPerformance[];
}

interface LiveChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversationId: number) => void;
  sendMessage: (conversationId: number, content: { text?: string; attachment?: Attachment }, sender: Sender, type?: 'public' | 'internal') => void;
  startNewConversation: (formData: { topic: string; message: string }) => Promise<void>;
  customerConversations: Conversation[];
  activeCustomerConversation: Conversation | null;
  setActiveCustomerConversation: (conversationId: number | null) => void;
  customerUnreadCount: number;
  cannedResponses: CannedResponse[];
  startTyping: (conversationId: number, userType: 'customer' | 'agent', previewText?: string) => void;
  stopTyping: (conversationId: number, userType: 'customer' | 'agent') => void;
  closeConversation: (conversationId: number) => void;
  reopenConversation: (conversationId: number) => void;
  rateConversation: (conversationId: number, rating: number, comment?: string) => void;
  getAIAssistance: (action: AIAssistAction, conversation: Conversation, currentText?: string) => Promise<string | void>;
  isAIAssisting: boolean;
  attentionRequiredCount: number;
  markAgentMessagesAsRead: (conversationId: number) => void;
  agentStatus: Record<number, AgentStatus>;
  setAgentStatus: (agentId: number, status: AgentStatus) => void;
  addTagToConversation: (conversationId: number, tag: string) => void;
  removeTagFromConversation: (conversationId: number, tag: string) => void;
  assignConversation: (conversationId: number, agentId: number | null) => void;
  snoozeConversation: (conversationId: number, snoozeUntil: string | null) => void;
  activeFilter: ConversationFilter;
  setActiveFilter: (filter: ConversationFilter) => void;
  mergeConversations: (primaryConversationId: number, secondaryConversationId: number) => void;
  analytics: ChatAnalytics;
}

export const LiveChatContext = createContext<LiveChatContextType | undefined>(undefined);

const playNotificationSound = () => {
    try {
        const audio = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV6urq6urq6urq6urq6urq6urq6urq6urqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExhdmY1Ni40MC4xMDH/wY8AAAAAAAAAAAAAAABgAAAa0AAAGAAS3gARwAAABHgaARgAP9KAIgAAIAgCAACYETKAIACAAAFTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV-');
        audio.play().catch(e => console.log("Audio playback failed. User interaction might be needed."));
    } catch (e) {
        console.error("Failed to play notification sound", e);
    }
};

const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const isOutsideOperatingHours = (): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    // Operating hours: 9 AM (9) to 9 PM (21)
    return currentHour < 9 || currentHour >= 21;
};


export const LiveChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [allConversations, setAllConversations] = useState<Conversation[]>(mockConversations);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const { user } = useAuth();
    const [isAIAssisting, setIsAIAssisting] = useState(false);
    
    const [customerConversations, setCustomerConversations] = useState<Conversation[]>([]);
    const [activeCustomerConversationId, setActiveCustomerConversationId] = useState<number | null>(null);
    const [agentStatus, setAgentStatusState] = useState<Record<number, AgentStatus>>({
        1: 'online', // Default Admin to online
        4: 'online', // Default CS to online
    });
    const [activeFilter, setActiveFilter] = useState<ConversationFilter>('all');


    // Init Gemini AI
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = "You are a friendly and helpful customer support agent for a restaurant named DineOS. Your goal is to answer customer questions accurately and politely. Keep your answers concise and to the point. The restaurant's menu includes Italian classics like Bruschetta, Calamari, Spaghetti Carbonara, Pizza Margherita, and Tiramisu. If you don't know the answer to a question, or if the user asks to speak to a human, or seems very frustrated, first say you'll connect them with a human agent, and then on a new line output the special token [HANDOFF_TO_HUMAN].";

    const conversations = useMemo(() => {
        if (!user) return [];
        
        let filtered = allConversations;
        const now = new Date();

        switch (activeFilter) {
            case 'mine':
                filtered = allConversations.filter(c => c.status === 'open' && c.assigneeId === user.id && (!c.snoozedUntil || new Date(c.snoozedUntil) <= now));
                break;
            case 'unassigned':
                filtered = allConversations.filter(c => c.status === 'open' && !c.assigneeId && (!c.snoozedUntil || new Date(c.snoozedUntil) <= now));
                break;
            case 'closed':
                filtered = allConversations.filter(c => c.status === 'closed');
                break;
            case 'snoozed':
                filtered = allConversations.filter(c => c.status === 'open' && c.snoozedUntil && new Date(c.snoozedUntil) > now);
                break;
            case 'all':
            default:
                filtered = allConversations.filter(c => c.status === 'open' && (!c.snoozedUntil || new Date(c.snoozedUntil) <= now));
                break;
        }
        return filtered.sort((a,b) => (new Date(b.messages[b.messages.length-1]?.timestamp).getTime() > new Date(a.messages[a.messages.length-1]?.timestamp).getTime()) ? 1 : -1);
    }, [allConversations, activeFilter, user]);

    const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
    const activeCustomerConversation = customerConversations.find(c => c.id === activeCustomerConversationId) || null;
    
    useEffect(() => {
        if (user && user.role === 'customer') {
            const loadCustomerConvos = async () => {
                const convos = await fetchConversationsByCustomerId(user.id);
                setCustomerConversations(convos);
            };
            loadCustomerConvos();
        }
    }, [user]);
    
    // Effect for checking snoozes
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            let changed = false;
            const updatedConversations = allConversations.map(c => {
                if (c.snoozedUntil && new Date(c.snoozedUntil) <= now) {
                    changed = true;
                    const systemMessage = createMessage({ text: "Snooze berakhir. Percakapan diaktifkan kembali." }, { id: 0, name: 'System', type: 'system' }, 'public');
                    return { ...c, snoozedUntil: undefined, messages: [...c.messages, systemMessage] };
                }
                return c;
            });

            if (changed) {
                setAllConversations(updatedConversations);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [allConversations]);


    const createMessage = (content: { text?: string; attachment?: Attachment }, sender: Sender, type: 'public' | 'internal'): Message => ({
        id: Date.now() + Math.random(), // more unique id
        sender,
        ...content,
        timestamp: new Date().toISOString(),
        type,
        read: false,
    });

    const markAgentMessagesAsRead = useCallback((conversationId: number) => {
        const updateConvoList = (list: Conversation[]) => list.map(c => {
            if (c.id === conversationId) {
                const hasUnreadAgentMessages = c.messages.some(m => m.sender.type === 'agent' && !m.read);
                if (!hasUnreadAgentMessages) return c;
    
                const updatedMessages = c.messages.map(m => {
                    if (m.sender.type === 'agent' && !m.read) {
                        return { ...m, read: true };
                    }
                    return m;
                });
                return { ...c, messages: updatedMessages };
            }
            return c;
        });

        setAllConversations(updateConvoList);
        setCustomerConversations(updateConvoList);
    }, []);

    const setActiveConversation = (conversationId: number) => {
        if (user && (user.role === 'cs' || user.role === 'admin')) {
            setAllConversations(prev => {
                const previousConvoId = activeConversationId;
                return prev.map(c => {
                    // Remove user from previous convo
                    if (c.id === previousConvoId && c.viewingAgents) {
                        return { ...c, viewingAgents: c.viewingAgents.filter(id => id !== user.id) };
                    }
                    // Add user to new convo
                    if (c.id === conversationId) {
                        const viewing = c.viewingAgents || [];
                        if (!viewing.includes(user.id)) {
                            viewing.push(user.id);
                        }
                        const updatedMessages = c.messages.map(m => {
                            if (m.sender.type === 'customer' && !m.read) return { ...m, read: true };
                            return m;
                        });
                        return { ...c, viewingAgents: viewing, messages: updatedMessages, unreadCount: 0, requiresHuman: false };
                    }
                    return c;
                });
            });
        }
        setActiveConversationId(conversationId);
    };
    
    const setActiveCustomerConversation = (conversationId: number | null) => {
        setActiveCustomerConversationId(conversationId);
        if (conversationId) {
            markAgentMessagesAsRead(conversationId);
        }
    };


    const startTyping = (conversationId: number, userType: 'customer' | 'agent', previewText?: string) => {
        const updateTyping = (list: Conversation[]) => list.map(c => {
            if (c.id === conversationId) {
                const updatedTyping = { ...c.typing, [userType]: true };
                if (userType === 'customer') {
                    updatedTyping.customerPreview = previewText;
                }
                return { ...c, typing: updatedTyping };
            }
            return c;
        });
        setAllConversations(updateTyping);
        setCustomerConversations(updateTyping);
    };

    const stopTyping = (conversationId: number, userType: 'customer' | 'agent') => {
        const updateTyping = (list: Conversation[]) => list.map(c => {
            if (c.id === conversationId) {
                const updatedTyping = { ...c.typing, [userType]: false };
                 if (userType === 'customer') {
                    updatedTyping.customerPreview = '';
                }
                return { ...c, typing: updatedTyping };
            }
            return c;
        });
        setAllConversations(updateTyping);
        setCustomerConversations(updateTyping);
    };
    
    const handleAIResponse = async (conversationId: number, messagesForContext: Message[], isNewConversation: boolean = false) => {
        startTyping(conversationId, 'agent');
        const contents = messagesForContext
            .filter(m => m.sender.type !== 'system' && m.type === 'public' && m.text)
            .map(m => ({
                role: m.sender.type === 'customer' ? 'user' : 'model',
                parts: [{ text: m.text! }]
            }));
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: { systemInstruction }
            });
            let aiText = response.text;
            let requiresHuman = false;

            if (aiText.includes('[HANDOFF_TO_HUMAN]')) {
                aiText = aiText.replace('[HANDOFF_TO_HUMAN]', '').trim();
                requiresHuman = true;
            }
            
            const aiReply = createMessage({ text: aiText }, { id: 99, name: 'AI Assistant', type: 'agent' }, 'public');
            const messagesToAdd = [aiReply];
            
            if(requiresHuman) {
                 messagesToAdd.push(createMessage({ text: "Percakapan dialihkan ke agen." }, { id: 0, name: 'System', type: 'system' }, 'public'));
            }

            const updateConvos = (prev: Conversation[]) => prev.map(c => {
                if (c.id === conversationId) {
                    const newConvo = { ...c, messages: [...c.messages, ...messagesToAdd] };
                    if (requiresHuman) {
                        newConvo.requiresHuman = true;
                        newConvo.unreadCount = (newConvo.unreadCount || 0) + 1;
                    }
                    return newConvo;
                }
                return c;
            });

            setAllConversations(updateConvos);
            if (user?.role === 'customer' || isNewConversation) {
                setCustomerConversations(updateConvos);
            }

            if (!document.hasFocus() || (user?.role === 'admin' && conversationId !== activeConversationId)) {
                playNotificationSound();
            }

        } catch (error) {
            console.error("Gemini API call failed:", error);
            const errorMessage = createMessage({ text: "Maaf, saya sedang mengalami kendala. Agen kami akan segera membantu Anda." }, { id: 99, name: 'AI Assistant', type: 'agent' }, 'public');
            const updateConvos = (prev: Conversation[]) => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, errorMessage] } : c);
            setAllConversations(updateConvos);
            setCustomerConversations(updateConvos);

        } finally {
            stopTyping(conversationId, 'agent');
        }
    };

    const sendMessage = useCallback((conversationId: number, content: { text?: string; attachment?: Attachment }, sender: Sender, type: 'public' | 'internal' = 'public') => {
        if (!content.text && !content.attachment) return;

        const newMessage = createMessage(content, sender, type);
        
        if (sender.type === 'customer' && (conversationId !== activeConversationId || !document.hasFocus())) {
            playNotificationSound();
        }

        const updateAndReorder = (prev: Conversation[]) => {
            let targetConvo: Conversation | undefined;
            const otherConvos = prev.filter(c => {
                if (c.id === conversationId) {
                    targetConvo = c;
                    return false;
                }
                return true;
            });
            
            if (targetConvo) {
                const updatedConvo = { ...targetConvo, messages: [...targetConvo.messages, newMessage], snoozedUntil: undefined };
                if (sender.type === 'customer') {
                    updatedConvo.unreadCount = (updatedConvo.unreadCount || 0) + 1;
                    updatedConvo.typing.customer = false;
                    updatedConvo.typing.customerPreview = '';
                }
                if (sender.type === 'customer' && type === 'public' && !targetConvo.requiresHuman && newMessage.text) {
                    handleAIResponse(conversationId, updatedConvo.messages);
                }
                 if(sender.type === 'agent' && type === 'public') {
                    updatedConvo.requiresHuman = false; // Agent has replied.
                    
                    // Calculate first response time
                    if (!updatedConvo.firstResponseTime) {
                        const firstCustomerMessage = updatedConvo.messages.find(m => m.sender.type === 'customer');
                        if (firstCustomerMessage) {
                            const responseTime = (new Date(newMessage.timestamp).getTime() - new Date(firstCustomerMessage.timestamp).getTime()) / 1000;
                            updatedConvo.firstResponseTime = Math.round(responseTime);
                        }
                    }
                }
                return [updatedConvo, ...otherConvos];
            }
            return prev;
        };

        setAllConversations(updateAndReorder);
        setCustomerConversations(updateAndReorder);

    }, [user, activeConversationId]);
    
    const startNewConversation = useCallback(async (formData: { topic: string; message: string }): Promise<void> => {
        if (!user) return;
        
        const newConversationStub = await createNewConversation(user.id, user.name, formData.message);
        
        if (newConversationStub) {
            const formattedInitialMessage = `Topik: ${formData.topic}\n\n${formData.message}`;
            const initialMsg = createMessage({ text: formattedInitialMessage }, { id: user.id, name: user.name, type: 'customer' }, 'public');
            
            let messages = [initialMsg];
            let requiresHuman = false;
    
            const outsideHours = isOutsideOperatingHours();
    
            if (outsideHours) {
                const autoReply = createMessage(
                    { text: "Terima kasih telah menghubungi kami! Saat ini kami sedang di luar jam operasional (09:00 - 21:00). Kami akan segera merespons pesan Anda saat kami kembali online." },
                    { id: 99, name: 'AI Assistant', type: 'agent' },
                    'public'
                );
                messages.push(autoReply);
                requiresHuman = true; // Flag for agents to see when they come back
            }
    
            const newConversationWithMsg: Conversation = { 
                ...newConversationStub, 
                messages, 
                requiresHuman,
                metadata: {
                    currentPage: window.location.hash.replace('#', ''),
                    device: 'Desktop', // Simplified for example
                }
            };
    
            const updateAndPrepend = (prev: Conversation[]) => [newConversationWithMsg, ...prev];
            
            setAllConversations(updateAndPrepend);
            setCustomerConversations(updateAndPrepend);
            
            setActiveCustomerConversationId(newConversationWithMsg.id);
    
            // Only trigger AI if within operating hours
            if (!outsideHours) {
                handleAIResponse(newConversationStub.id, newConversationWithMsg.messages, true);
            }
        }
    }, [user]);

    const assignConversation = useCallback((conversationId: number, agentId: number | null) => {
        const agent = agentId ? mockUsers.find(u => u.id === agentId) : null;
        const messageText = agent ? `Percakapan ditugaskan ke ${agent.name}.` : 'Tugas percakapan dihapus.';
        const systemMessage = createMessage({ text: messageText }, { id: 0, name: 'System', type: 'system' }, 'public');
        
        const updateAssignee = (list: Conversation[]) => list.map(c => {
            if (c.id === conversationId) {
                return { ...c, assigneeId: agentId || undefined, messages: [...c.messages, systemMessage] };
            }
            return c;
        });

        setAllConversations(updateAssignee);
        setCustomerConversations(updateAssignee);
    }, []);

    const prevConversations = usePrevious(allConversations);

    // Effect for handling notifications on new assignments
    useEffect(() => {
        if (!user || !prevConversations || !document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;

        allConversations.forEach(currentConvo => {
            const prevConvo = (prevConversations as Conversation[]).find(p => p.id === currentConvo.id);
            if (prevConvo && 
                currentConvo.assigneeId === user.id && 
                prevConvo.assigneeId !== user.id)
            {
                playNotificationSound();
                const notification = new Notification('Chat Baru Ditugaskan', {
                    body: `Anda mendapat chat baru dari ${currentConvo.customerName}.`,
                    icon: logoDataUri,
                    tag: `conversation-${currentConvo.id}`
                });
                notification.onclick = () => {
                    window.focus();
                    setActiveConversationId(currentConvo.id);
                };
            }
        });
    }, [allConversations, user, prevConversations]);

    // Effect for Auto-Assigning Conversations
    useEffect(() => {
        const unassignedChat = conversations.find(c => c.status === 'open' && c.requiresHuman && !c.assigneeId);

        if (unassignedChat) {
            const onlineAgents = mockUsers.filter(u => 
                (u.role === 'cs' || u.role === 'admin') && 
                (agentStatus[u.id] || 'offline') === 'online'
            );
            
            if (onlineAgents.length > 0) {
                const agentToAssign = onlineAgents[0]; // Simple assignment
                
                const assignmentTimeout = setTimeout(() => {
                    const latestVersionOfChat = allConversations.find(c => c.id === unassignedChat.id);
                    if (latestVersionOfChat && !latestVersionOfChat.assigneeId) {
                         assignConversation(unassignedChat.id, agentToAssign.id);
                    }
                }, 1000);
                return () => clearTimeout(assignmentTimeout);
            }
        }
    }, [conversations, agentStatus, allConversations, assignConversation]);

    // Simulate new conversation for agents
    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'cs')) {
            const timer = setTimeout(() => {
                const doni = mockUsers.find(u => u.id === 5);
                if (doni && !allConversations.some(c => c.customerId === doni.id)) {
                    
                    const simulateNewConversation = async () => {
                        const newConversationStub = await createNewConversation(doni.id, doni.name, "");
                        
                        if (newConversationStub) {
                            const initialMsgText = "Halo, apakah Bistecca alla Fiorentina ready untuk dine-in malam ini?";
                            const initialMsg = createMessage({ text: initialMsgText }, { id: doni.id, name: doni.name, type: 'customer' }, 'public');
                            
                            const updateConvos = (prev: Conversation[]) => {
                                const convoExists = prev.some(c => c.id === newConversationStub.id);
                                if (convoExists) return prev; // Avoid duplicates
                                
                                const newConvo = { ...newConversationStub, messages: [initialMsg] };
                                Promise.resolve().then(() => handleAIResponse(newConversationStub.id, [initialMsg]));
                                return [newConvo, ...prev];
                            };
                            setAllConversations(updateConvos);
                        }
                    };
                    simulateNewConversation();
                }
            }, 15000); // 15 seconds

            return () => clearTimeout(timer);
        }
    }, [user, allConversations]);

    const closeConversation = useCallback((conversationId: number) => {
        const agentName = user?.name || 'Agent';
        const systemMessage = createMessage({ text: `Percakapan ditutup oleh ${agentName}.` }, { id: 0, name: 'System', type: 'system' }, 'public');
        
        const updateStatus = (prev: Conversation[]) => prev.map(c => {
            if (c.id === conversationId) {
                const firstMessageTime = new Date(c.messages[0]?.timestamp).getTime();
                const lastMessageTime = new Date().getTime();
                const duration = firstMessageTime ? (lastMessageTime - firstMessageTime) / 1000 : undefined;
                return { ...c, status: 'closed', messages: [...c.messages, systemMessage], unreadCount: 0, duration: duration };
            }
            return c;
        });
        setAllConversations(updateStatus);
        setCustomerConversations(updateStatus);
    }, [user]);

    const reopenConversation = useCallback((conversationId: number) => {
        const systemMessage = createMessage({ text: `Percakapan dibuka kembali oleh pelanggan.` }, { id: 0, name: 'System', type: 'system' }, 'public');

        const updateAndReorder = (prev: Conversation[]) => {
            let targetConvo: Conversation | undefined;
            const otherConvos = prev.filter(c => {
                if (c.id === conversationId) {
                    targetConvo = c;
                    return false;
                }
                return true;
            });
            if (targetConvo) {
                const updatedConvo = { ...targetConvo, status: 'open' as 'open', messages: [...targetConvo.messages, systemMessage], unreadCount: 1, requiresHuman: true };
                return [updatedConvo, ...otherConvos];
            }
            return prev;
        };

        setAllConversations(updateAndReorder);
        setCustomerConversations(updateAndReorder);
    }, []);

    const rateConversation = useCallback((conversationId: number, rating: number, comment?: string) => {
        const csat: CSAT = { rating, comment };
        const systemMessage = createMessage({ text: `Pelanggan memberikan rating ${csat.rating}/5 bintang.` }, { id: 0, name: 'System', type: 'system' }, 'public');
        
        const updateRating = (prev: Conversation[]) => prev.map(c =>
            c.id === conversationId 
            ? { ...c, csat, messages: [...c.messages, systemMessage] } 
            : c
        );
        setAllConversations(updateRating);
        setCustomerConversations(updateRating);
    }, []);

    const getAIAssistance = useCallback(async (action: AIAssistAction, conversation: Conversation, currentText?: string): Promise<string | void> => {
        setIsAIAssisting(true);

        const conversationHistory = conversation.messages
            .filter(m => m.type === 'public' && m.sender.type !== 'system' && m.text)
            .map(m => `${m.sender.name} (${m.sender.type}): ${m.text}`)
            .join('\n');

        let prompt = '';
        switch (action) {
            case 'summarize':
                prompt = `Summarize the following customer support conversation concisely for an internal note. Focus on the customer's issue and the resolution status.\n\nConversation:\n${conversationHistory}`;
                break;
            case 'suggest':
                prompt = `You are a helpful support agent. Based on the following conversation, suggest a polite and effective reply to the customer. Output only the suggested reply text.\n\nConversation:\n${conversationHistory}`;
                break;
            case 'improve':
                if (!currentText) {
                    setIsAIAssisting(false);
                    return;
                }
                prompt = `You are a helpful support agent. Rewrite the following draft reply to be more clear, professional, and friendly. Output only the improved reply text.\n\nDraft:\n${currentText}`;
                break;
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });

            const resultText = response.text.trim();

            if (action === 'summarize') {
                if (user) {
                    const noteMessage = createMessage(
                        { text: `AI Summary:\n${resultText}` },
                        { id: user.id, name: user.name, type: 'agent' },
                        'internal'
                    );
                    setAllConversations(prev => prev.map(c =>
                        c.id === conversation.id ? { ...c, messages: [...c.messages, noteMessage] } : c
                    ));
                }
            } else {
                return resultText; // For 'suggest' and 'improve'
            }
        } catch (error) {
            console.error("AI Assist call failed:", error);
            // In a real app, you'd show a toast here.
        } finally {
            setIsAIAssisting(false);
        }
    }, [user]);
    
    const attentionRequiredCount = useMemo(() =>
        allConversations.filter(c => c.requiresHuman && c.status === 'open').length,
    [allConversations]);
    
    const customerUnreadCount = useMemo(() =>
        customerConversations.reduce((count, convo) => {
            const unreadInConvo = convo.messages.filter(m => m.sender.type === 'agent' && !m.read && m.type === 'public').length;
            return count + unreadInConvo;
        }, 0),
    [customerConversations]);

    const setAgentStatus = (agentId: number, status: AgentStatus) => {
        setAgentStatusState(prev => ({ ...prev, [agentId]: status }));
    };

    const addTagToConversation = (conversationId: number, tag: string) => {
        const updateTags = (list: Conversation[]) => list.map(c => {
            if (c.id === conversationId) {
                const newTags = [...(c.tags || [])];
                if (!newTags.includes(tag)) {
                    newTags.push(tag);
                }
                return { ...c, tags: newTags };
            }
            return c;
        });
        setAllConversations(updateTags);
        setCustomerConversations(updateTags);
    };

    const removeTagFromConversation = (conversationId: number, tagToRemove: string) => {
        const updateTags = (list: Conversation[]) => list.map(c => {
            if (c.id === conversationId) {
                const newTags = (c.tags || []).filter(tag => tag !== tagToRemove);
                return { ...c, tags: newTags };
            }
            return c;
        });
        setAllConversations(updateTags);
        setCustomerConversations(updateTags);
    };
    
    const snoozeConversation = (conversationId: number, snoozeUntil: string | null) => {
        const systemMessage = createMessage(
            { text: snoozeUntil ? `Percakapan ditunda oleh ${user?.name}.` : `Percakapan diaktifkan kembali.` },
            { id: 0, name: 'System', type: 'system' }, 'public'
        );
        
        const updateSnooze = (list: Conversation[]) => list.map(c => {
            if (c.id === conversationId) {
                return { ...c, snoozedUntil: snoozeUntil || undefined, messages: [...c.messages, systemMessage] };
            }
            return c;
        });
        setAllConversations(updateSnooze);
        if (activeConversationId === conversationId) {
            setActiveConversationId(null);
        }
    };

    const mergeConversations = (primaryId: number, secondaryId: number) => {
        setAllConversations(prev => {
            const primaryConvo = prev.find(c => c.id === primaryId);
            const secondaryConvo = prev.find(c => c.id === secondaryId);

            if (!primaryConvo || !secondaryConvo) return prev;
    
            const combinedMessages = [...primaryConvo.messages, ...secondaryConvo.messages];
            combinedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
            const systemMessage = createMessage(
                { text: `Percakapan #${secondaryConvo.id} digabung ke percakapan ini.` },
                { id: 0, name: 'System', type: 'system' },
                'public'
            );
            combinedMessages.push(systemMessage);
    
            const updatedPrimaryConvo = { ...primaryConvo, messages: combinedMessages };
    
            const remainingConversations = prev.filter(c => c.id !== secondaryId);
            return remainingConversations.map(c => c.id === primaryId ? updatedPrimaryConvo : c);
        });
    };

    const analytics = useMemo((): ChatAnalytics => {
        const closedConversations = allConversations.filter(c => c.status === 'closed');
        const ratedConversations = closedConversations.filter(c => c.csat);

        // Average Satisfaction
        const totalSatisfaction = ratedConversations.reduce((sum, c) => sum + (c.csat?.rating || 0), 0);
        const averageSatisfaction = ratedConversations.length > 0 ? totalSatisfaction / ratedConversations.length : null;

        // Satisfaction Distribution
        const satisfactionDistribution = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: ratedConversations.filter(c => c.csat?.rating === star).length
        }));

        // Average First Response Time
        const responseTimes = closedConversations.map(c => c.firstResponseTime).filter((t): t is number => t !== undefined);
        const averageFirstResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null;

        // Average Chat Duration
        const durations = closedConversations.map(c => c.duration).filter((d): d is number => d !== undefined);
        const averageChatDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;

        // Agent Performance
        const agentPerformanceMap = new Map<number, { name: string; totalRating: number; ratedChats: number; totalChats: number }>();
        closedConversations.forEach(c => {
            if (c.assigneeId) {
                if (!agentPerformanceMap.has(c.assigneeId)) {
                    const agent = mockUsers.find(u => u.id === c.assigneeId);
                    agentPerformanceMap.set(c.assigneeId, { name: agent?.name || `Agent #${c.assigneeId}`, totalRating: 0, ratedChats: 0, totalChats: 0 });
                }
                const agentData = agentPerformanceMap.get(c.assigneeId)!;
                agentData.totalChats += 1;
                if (c.csat) {
                    agentData.ratedChats += 1;
                    agentData.totalRating += c.csat.rating;
                }
            }
        });

        const agentPerformance = Array.from(agentPerformanceMap.entries()).map(([agentId, data]) => ({
            agentId,
            agentName: data.name,
            chatsHandled: data.totalChats,
            averageSatisfaction: data.ratedChats > 0 ? data.totalRating / data.ratedChats : null,
        })).sort((a, b) => b.chatsHandled - a.chatsHandled);

        return {
            totalChats: allConversations.length,
            averageSatisfaction,
            averageFirstResponseTime,
            averageChatDuration,
            satisfactionDistribution,
            agentPerformance,
        };
    }, [allConversations]);


    return (
        <LiveChatContext.Provider value={{
            conversations,
            activeConversation,
            setActiveConversation,
            sendMessage,
            startNewConversation,
            customerConversations,
            activeCustomerConversation,
            setActiveCustomerConversation,
            customerUnreadCount,
            cannedResponses: mockCannedResponses,
            startTyping,
            stopTyping,
            closeConversation,
            reopenConversation,
            rateConversation,
            getAIAssistance,
            isAIAssisting,
            attentionRequiredCount,
            markAgentMessagesAsRead,
            agentStatus,
            setAgentStatus,
            addTagToConversation,
            removeTagFromConversation,
            assignConversation,
            snoozeConversation,
            activeFilter,
            setActiveFilter,
            mergeConversations,
            analytics,
        }}>
            {children}
        </LiveChatContext.Provider>
    );
};

export const useLiveChat = () => {
    const context = useContext(LiveChatContext);
    if (context === undefined) {
        throw new Error('useLiveChat must be used within a LiveChatProvider');
    }
    return context;
};