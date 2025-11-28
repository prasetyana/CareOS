import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@core/hooks/useToast';
import { MenuItem, fetchMenuItems, fetchCategories, deleteMenuItem, Category } from '@core/data/mockDB';
import Modal from '@ui/Modal';

const KelolaMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadItems = async () => {
    setLoading(true);
    const [items, cats] = await Promise.all([fetchMenuItems(), fetchCategories()]);
    setMenuItems(items);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleEditClick = (item: MenuItem) => {
    navigate(`/admin/menu/edit-menu/${item.slug}`);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const success = await deleteMenuItem(itemToDelete.id);
      if (success) {
        addToast(`'${itemToDelete.name}' telah dihapus.`, 'success');
        loadItems();
      } else {
        addToast(`Gagal menghapus '${itemToDelete.name}'.`, 'error');
      }
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kelola Menu</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Atur daftar menu restoran Anda di sini.</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari menu berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all shadow-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'Semua'
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category.name
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <li className="p-6 text-center text-brand-secondary dark:text-gray-400">Memuat menu...</li>
          ) : currentItems.length === 0 ? (
            <li className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Tidak ada menu yang ditemukan.</p>
            </li>
          ) : (
            currentItems.map(item => (
              <li key={item.id} className="p-4 sm:p-6 group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0 bg-gray-100 dark:bg-gray-700" />
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-brand-dark dark:text-gray-200 truncate">{item.name}</p>
                      <p className="text-sm text-brand-secondary dark:text-gray-400">{item.price}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 mt-1">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => handleEditClick(item)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-brand-secondary dark:text-gray-400" aria-label={`Edit ${item.name}`}>
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500" aria-label={`Delete ${item.name}`}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* Pagination Controls */}
        {!loading && filteredItems.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Menampilkan {indexOfFirstItem + 1} sampai {Math.min(indexOfLastItem, filteredItems.length)} dari {filteredItems.length} menu
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>
              {Array.from({ length: Math.ceil(filteredItems.length / itemsPerPage) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                    ? 'bg-brand-primary text-white'
                    : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
                className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <p className="text-brand-secondary dark:text-gray-300">
          Anda yakin ingin menghapus item "{itemToDelete?.name}"? Aksi ini tidak dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={() => setIsConfirmModalOpen(false)} className="px-6 py-2 rounded-full text-brand-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border dark:border-gray-600">Batal</button>
          <button onClick={handleConfirmDelete} className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700">Hapus</button>
        </div>
      </Modal>
    </div>
  );
};

export default KelolaMenu;
