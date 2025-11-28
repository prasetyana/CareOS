import React, { useState, useEffect, useRef } from 'react';
import { Tag, ImageIcon, Plus, Upload, Trash2, Clock, Info, Flame, Leaf, Award, DollarSign, Save, X, AlertCircle } from 'lucide-react';
import { MenuItem, Category, fetchCategories, addMenuItem, updateMenuItem } from '@core/data/mockDB';
import Dropdown from '@ui/Dropdown';

interface MenuItemFormData extends Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> {
  dietaryTagsString: string;
  ingredientsString: string;
  allergensString: string;
  images: string[];
};

interface MenuItemFormProps {
  initialData?: MenuItem | null;
  onSuccess: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ initialData, onSuccess }) => {
  const defaultState: MenuItemFormData = {
    name: '',
    description: '',
    price: '',
    category: 'Hidangan Utama',
    image: '',
    images: [],
    slug: '',
    badge: '',
    cookTime: '',
    prepTime: '',
    servingInfo: '',
    mainIngredient: '',
    calories: undefined,
    isPromo: false,
    originalPrice: '',
    dietaryTags: [],
    dietaryTagsString: '',
    ingredients: [],
    ingredientsString: '',
    allergens: [],
    allergensString: '',
    isVegetarian: false,
    isHalal: false,
    spicyLevel: 0,
    rating: 0,
  };

  const [formData, setFormData] = useState<MenuItemFormData>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dietaryTagsString: initialData.dietaryTags ? initialData.dietaryTags.join(', ') : '',
        ingredientsString: initialData.ingredients ? initialData.ingredients.join(', ') : '',
        allergensString: initialData.allergens ? initialData.allergens.join(', ') : '',
        badge: initialData.badge || '',
        cookTime: initialData.cookTime || '',
        prepTime: initialData.prepTime || '',
        servingInfo: initialData.servingInfo || '',
        mainIngredient: initialData.mainIngredient || '',
        originalPrice: initialData.originalPrice || '',
        isPromo: initialData.isPromo || false,
        isVegetarian: initialData.isVegetarian || false,
        isHalal: initialData.isHalal || false,
        spicyLevel: initialData.spicyLevel || 0,
        calories: initialData.calories || undefined,
        images: initialData.images || (initialData.image ? [initialData.image] : []),
      });
    } else {
      setFormData(defaultState);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'dietaryTagsString') {
      setFormData(prev => ({ ...prev, dietaryTagsString: value }));
    } else if (name === 'ingredientsString') {
      setFormData(prev => ({ ...prev, ingredientsString: value }));
    } else if (name === 'allergensString') {
      setFormData(prev => ({ ...prev, allergensString: value }));
    } else if (name === 'calories') {
      setFormData(prev => ({ ...prev, calories: value === '' ? undefined : Number(value) }));
    } else if (name === 'spicyLevel') {
      setFormData(prev => ({ ...prev, spicyLevel: Number(value) as 0 | 1 | 2 | 3 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (value: MenuItem['category']) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
        image: prev.images.length === 0 ? newImageUrl.trim() : prev.image // Set primary image if it's the first one
      }));
      setNewImageUrl('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newImagesPromises = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) resolve(reader.result as string);
          };
          reader.readAsDataURL(file as Blob);
        });
      });

      const newBase64Images = await Promise.all(newImagesPromises);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newBase64Images],
        image: prev.images.length === 0 && newBase64Images.length > 0 ? newBase64Images[0] : prev.image
      }));

      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : '' // Update primary image
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dietaryTags = formData.dietaryTagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const ingredients = formData.ingredientsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const allergens = formData.allergensString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Ensure images array is populated and primary image is set
    const images = formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : []);
    const primaryImage = images.length > 0 ? images[0] : '';

    const dataToSubmit = {
      ...formData,
      slug,
      image: primaryImage,
      images,
      dietaryTags,
      ingredients,
      allergens,
      badge: formData.badge || undefined,
      cookTime: formData.cookTime || undefined,
      prepTime: formData.prepTime || undefined,
      servingInfo: formData.servingInfo || undefined,
      mainIngredient: formData.mainIngredient || undefined,
      originalPrice: formData.isPromo ? formData.originalPrice : undefined,
    };

    delete (dataToSubmit as any).dietaryTagsString;
    delete (dataToSubmit as any).ingredientsString;
    delete (dataToSubmit as any).allergensString;

    try {
      if (initialData) {
        await updateMenuItem(initialData.id, dataToSubmit);
      } else {
        await addMenuItem(dataToSubmit);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save menu item", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const sectionTitleClasses = "text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Informasi Utama */}
      <div className="space-y-6">
        <h3 className={sectionTitleClasses}>
          <Tag size={20} className="text-brand-primary" />
          Informasi Utama
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className={labelClasses}>Nama Menu</label>
            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Contoh: Nasi Goreng Spesial" />
          </div>
          <div>
            <label htmlFor="description" className={labelClasses}>Deskripsi</label>
            <textarea name="description" id="description" required rows={3} value={formData.description} onChange={handleChange} className={inputClasses} placeholder="Jelaskan rasa, tekstur, dan bahan utama..."></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className={labelClasses}>Kategori</label>
              <Dropdown
                id="category"
                options={categories.map(c => c.name)}
                value={formData.category}
                onChange={handleCategoryChange}
              />
            </div>
            <div>
              <label htmlFor="price" className={labelClasses}>Harga</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rp</span>
                <input type="text" name="price" id="price" required value={formData.price.replace('Rp ', '')} onChange={(e) => setFormData(prev => ({ ...prev, price: `Rp ${e.target.value}` }))} className={`${inputClasses} pl-12`} placeholder="50.000" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Media Gallery */}
      <div className="space-y-6">
        <h3 className={sectionTitleClasses}>
          <ImageIcon size={20} className="text-brand-primary" />
          Galeri Foto
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex-grow">
              <label htmlFor="newImageUrl" className={labelClasses}>Tambah Gambar</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="newImageUrl"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className={inputClasses}
                  placeholder="https://images.unsplash.com/..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={20} />
                  Tambah
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className={labelClasses}>Upload File</label>
              <label className="flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Upload size={20} className="mr-2 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Pilih File</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Image Preview Grid */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">
                      Utama
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Detail Menu (Apple Style) */}
      <div className="space-y-6">
        <h3 className={sectionTitleClasses}>
          <Info size={20} className="text-brand-primary" />
          Detail Menu
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cookTime" className={labelClasses}>Waktu Masak</label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="cookTime" id="cookTime" value={formData.cookTime} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="~15 mnt" />
            </div>
          </div>
          <div>
            <label htmlFor="prepTime" className={labelClasses}>Waktu Persiapan</label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" name="prepTime" id="prepTime" value={formData.prepTime} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="10 mnt" />
            </div>
          </div>
          <div>
            <label htmlFor="calories" className={labelClasses}>Kalori (kkal)</label>
            <div className="relative">
              <Flame size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" name="calories" id="calories" value={formData.calories || ''} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="350" />
            </div>
          </div>
          <div>
            <label htmlFor="servingInfo" className={labelClasses}>Info Penyajian</label>
            <input type="text" name="servingInfo" id="servingInfo" value={formData.servingInfo} onChange={handleChange} className={inputClasses} placeholder="Disajikan hangat dengan saus..." />
          </div>
        </div>
      </div>

      {/* 4. Bahan & Diet */}
      <div className="space-y-6">
        <h3 className={sectionTitleClasses}>
          <Leaf size={20} className="text-brand-primary" />
          Bahan & Diet
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="mainIngredient" className={labelClasses}>Bahan Utama</label>
            <input type="text" name="mainIngredient" id="mainIngredient" value={formData.mainIngredient} onChange={handleChange} className={inputClasses} placeholder="Ayam, Sapi, Tahu..." />
          </div>
          <div>
            <label htmlFor="ingredientsString" className={labelClasses}>Komposisi (pisahkan dengan koma)</label>
            <textarea name="ingredientsString" id="ingredientsString" rows={2} value={formData.ingredientsString} onChange={handleChange} className={inputClasses} placeholder="Bawang, Cabai, Kecap..."></textarea>
          </div>
          <div>
            <label htmlFor="allergensString" className={labelClasses}>Alergen (pisahkan dengan koma)</label>
            <div className="relative">
              <AlertCircle size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea name="allergensString" id="allergensString" rows={2} value={formData.allergensString} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="Kacang, Telur, Gluten..."></textarea>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isVegetarian" checked={formData.isVegetarian} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isHalal" checked={formData.isHalal} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Halal</span>
            </label>
          </div>

          <div>
            <label className={labelClasses}>Tingkat Pedas (0-3)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                name="spicyLevel"
                min="0"
                max="3"
                step="1"
                value={formData.spicyLevel}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="font-medium text-gray-900 dark:text-white w-8 text-center">{formData.spicyLevel}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Tidak Pedas</span>
              <span>Sedang</span>
              <span>Pedas</span>
              <span>Sangat Pedas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Promosi & Badge */}
      <div className="space-y-6">
        <h3 className={sectionTitleClasses}>
          <Award size={20} className="text-brand-primary" />
          Promosi & Badge
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="badge" className={labelClasses}>Badge (Opsional)</label>
            <input type="text" name="badge" id="badge" value={formData.badge} onChange={handleChange} className={inputClasses} placeholder="✨ Rekomendasi Chef" />
          </div>
          <div className="flex items-center gap-2 pt-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isPromo" checked={formData.isPromo} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aktifkan Harga Promo</span>
            </label>
          </div>
          {formData.isPromo && (
            <div className="md:col-span-2">
              <label htmlFor="originalPrice" className={labelClasses}>Harga Coret (Sebelum Diskon)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">Rp</span>
                <input type="text" name="originalPrice" id="originalPrice" value={formData.originalPrice?.replace('Rp ', '')} onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: `Rp ${e.target.value}` }))} className={`${inputClasses} pl-12`} placeholder="75.000" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onSuccess()} // Cancel just closes/refreshes
          className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/25 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>Menyimpan...</>
          ) : (
            <>
              <Save size={20} />
              Simpan Menu
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;
