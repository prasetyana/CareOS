
import React, { useState, useEffect } from 'react';
import { MenuItem, fetchMenuItems, deleteMenuItem } from '@core/data/mockDB';
import Modal from '@ui/Modal';
import MenuItemForm from '@modules/admin/components/MenuItemForm';
import EditIcon from '@ui/icons/EditIcon';
import TrashIcon from '@ui/icons/TrashIcon';
import { useToast } from '@core/hooks/useToast';

type FormMode = 'add' | 'edit';

const AdminMenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<FormMode>('add');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { addToast } = useToast();

  const loadItems = async () => {
    setLoading(true);
    const items = await fetchMenuItems();
    setMenuItems(items);
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    loadItems(); // Refresh list
    addToast(`Menu item successfully ${modalMode === 'add' ? 'added' : 'updated'}.`, 'success');
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const success = await deleteMenuItem(itemToDelete.id);
      if (success) {
        addToast(`'${itemToDelete.name}' has been deleted.`, 'success');
        loadItems();
      } else {
        addToast(`Failed to delete '${itemToDelete.name}'.`, 'error');
      }
      setIsConfirmModalOpen(false);
      setItemToDelete(null);
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto text-right mb-8">
        <button
          onClick={handleOpenAddModal}
          className="bg-brand-primary text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors duration-300 transform hover:scale-105"
        >
          + Add New Item
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="p-6 text-center text-brand-secondary">Loading menu...</li>
          ) : (
            menuItems.map(item => (
              <li key={item.id} className="p-4 sm:p-6 group hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-brand-dark truncate">{item.name}</p>
                      <p className="text-sm text-brand-secondary">{item.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => handleOpenEditModal(item)} className="p-2 rounded-full hover:bg-gray-200" aria-label={`Edit ${item.name}`}>
                      <EditIcon className="w-5 h-5 text-brand-secondary" />
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="p-2 rounded-full hover:bg-gray-200" aria-label={`Delete ${item.name}`}>
                      <TrashIcon className="w-5 h-5 text-red-500" />
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
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
      >
        <MenuItemForm
          initialData={selectedItem}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Deletion"
      >
        <p className="text-brand-secondary">
          Are you sure you want to delete the item "{itemToDelete?.name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={() => setIsConfirmModalOpen(false)} className="px-6 py-2 rounded-full text-brand-secondary hover:bg-gray-100 border">Cancel</button>
          <button onClick={handleConfirmDelete} className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMenuPage;
