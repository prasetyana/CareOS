import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save } from 'lucide-react';
import { Category, fetchCategories, addCategory, updateCategory, deleteCategory } from '../../data/mockDB';
import Modal from '../../components/Modal';

const KategoriMenu: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setLoading(false);
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name, description: category.description || '' });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const slug = formData.name.toLowerCase().replace(/\s+/g, '-');

        if (editingCategory) {
            await updateCategory(editingCategory.id, { ...formData, slug });
        } else {
            await addCategory({ ...formData, slug });
        }

        await loadCategories();
        setLoading(false);
        handleCloseModal();
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            setLoading(true);
            await deleteCategory(categoryToDelete.id);
            await loadCategories();
            setLoading(false);
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kategori Menu</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola kategori untuk menu restoran Anda.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    <span>Tambah Kategori</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari kategori..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <li className="p-6 text-center text-brand-secondary dark:text-gray-400">Memuat kategori...</li>
                    ) : filteredCategories.length === 0 ? (
                        <li className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <p>Tidak ada kategori yang ditemukan.</p>
                        </li>
                    ) : (
                        filteredCategories.map((category) => (
                            <li key={category.id} className="p-4 sm:p-6 group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-brand-dark dark:text-gray-200 truncate">{category.name}</h3>
                                        <p className="text-sm text-brand-secondary dark:text-gray-400 line-clamp-1">
                                            {category.description || 'Tidak ada deskripsi'}
                                        </p>
                                        <div className="mt-1 text-xs text-gray-400 font-mono">
                                            Slug: {category.slug}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                                        <button
                                            onClick={() => handleOpenModal(category)}
                                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-brand-secondary dark:text-gray-400"
                                            aria-label={`Edit ${category.name}`}
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(category)}
                                            className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                                            aria-label={`Delete ${category.name}`}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nama Kategori
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                            placeholder="Contoh: Hidangan Utama"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none"
                            placeholder="Deskripsi singkat kategori..."
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Simpan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Hapus Kategori"
            >
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-gray-900 dark:text-white">"{categoryToDelete?.name}"</span>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={loading}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    <span>Hapus</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default KategoriMenu;