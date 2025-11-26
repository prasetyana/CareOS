import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { KnowledgeBaseItem, fetchKnowledgeBase, deleteKnowledgeBaseItem } from '../../data/mockDB';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/Modal';
import { Plus, Search, ChevronDown, Edit, Trash2 } from 'lucide-react';
import SegmentedControl from '../../components/SegmentedControl';

// Simple markdown renderer
const renderMarkdown = (markdownText: string) => {
    if (!markdownText) return '';
    const lines = markdownText.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        if (line.trim().startsWith('- ')) {
            const listItemContent = line.trim().substring(2);
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${listItemContent}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            if (line.trim() !== '') {
                html += `<p>${line}</p>`;
            } else {
                 if (html.endsWith('</p>')) {
                    html += '<br />';
                }
            }
        }
    });

    if (inList) {
        html += '</ul>';
    }
    return html;
};


const FaqManagementPage: React.FC = () => {
    const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openItemId, setOpenItemId] = useState<number | null>(null);
    const navigate = useNavigate();
    
    const [selectedCategory, setSelectedCategory] = useState<'Semua' | KnowledgeBaseItem['category']>('Semua');
    const categories: ('Semua' | KnowledgeBaseItem['category'])[] = ['Semua', 'Operasional', 'Menu', 'Pembayaran', 'Promo'];

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<KnowledgeBaseItem | null>(null);
    
    const { addToast } = useToast();

    const loadItems = async () => {
        setLoading(true);
        const fetchedItems = await fetchKnowledgeBase();
        setItems(fetchedItems);
        setLoading(false);
    };

    useEffect(() => {
        loadItems();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
            const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.answer.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        }).sort((a,b) => a.id - b.id);
    }, [items, searchTerm, selectedCategory]);
    
    const handleDeleteClick = (item: KnowledgeBaseItem) => {
        setItemToDelete(item);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        
        const success = await deleteKnowledgeBaseItem(itemToDelete.id);
        if (success) {
            addToast(`FAQ telah dihapus.`, 'success');
            loadItems();
        } else {
            addToast(`Gagal menghapus FAQ.`, 'error');
        }
        setIsConfirmModalOpen(false);
        setItemToDelete(null);
    };

    const AccordionItem: React.FC<{ item: KnowledgeBaseItem }> = ({ item }) => {
        const isOpen = openItemId === item.id;
        return (
            <div className="border-b border-black/10 dark:border-white/10 last:border-b-0">
                <button
                    onClick={() => setOpenItemId(isOpen ? null : item.id)}
                    className="w-full flex justify-between items-center text-left py-4 px-6"
                    aria-expanded={isOpen}
                >
                    <span className="font-semibold text-text-primary dark:text-gray-200">{item.question}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                    </motion.div>
                </button>
                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            key="content"
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                                open: { opacity: 1, height: 'auto', y: 0 },
                                collapsed: { opacity: 0, height: 0, y: -10 }
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6">
                                <div 
                                    className="faq-answer-content text-text-muted dark:text-gray-400"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(item.answer) }} 
                                />
                                <div className="mt-4 flex items-center gap-2">
                                    <button onClick={() => navigate(`/cs/kelola-faq/edit/${item.id}`)} className="flex items-center gap-2 text-sm font-medium text-accent hover:underline"><Edit size={14}/> Edit</button>
                                    <button onClick={() => handleDeleteClick(item)} className="flex items-center gap-2 text-sm font-medium text-danger hover:underline"><Trash2 size={14}/> Hapus</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold font-sans text-brand-dark dark:text-gray-200">Kelola FAQ</h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Cari FAQ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-black/5 dark:bg-white/5 border border-transparent focus:border-accent focus:ring-1 focus:ring-accent rounded-full text-sm transition"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/cs/kelola-faq/baru')}
                        className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-full font-medium hover:bg-red-700 transition-colors duration-300"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Tambah FAQ</span>
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <SegmentedControl
                    id="faq-category-filter"
                    options={categories}
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val as 'Semua' | KnowledgeBaseItem['category'])}
                />
            </div>

            <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-text-muted">Memuat...</div>
                ) : filteredItems.length > 0 ? (
                    filteredItems.map(item => <AccordionItem key={item.id} item={item} />)
                ) : (
                    <div className="p-6 text-center text-text-muted">Tidak ada hasil ditemukan.</div>
                )}
            </div>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Konfirmasi Hapus">
                <p className="text-brand-secondary dark:text-gray-300">
                    Anda yakin ingin menghapus FAQ: "{itemToDelete?.question}"? Aksi ini tidak dapat dibatalkan.
                </p>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setIsConfirmModalOpen(false)} className="px-6 py-2 rounded-full text-brand-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-600">Batal</button>
                    <button onClick={handleConfirmDelete} className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700">Hapus</button>
                </div>
            </Modal>
        </div>
    );
};

export default FaqManagementPage;