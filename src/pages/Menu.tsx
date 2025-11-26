
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Link } from "react-router-dom";
import { MenuItem, fetchMenuItems } from '../data/mockDB';
import MenuCard from '../components/MenuCard';
import MenuCardSkeleton from '../components/MenuCardSkeleton';
import PageHeader from '../components/PageHeader';
import { Search } from 'lucide-react';
import ScrollableTabs from '../components/ScrollableTabs';

const Menu: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | MenuItem['category']>('Semua');

  const categories: ('Semua' | MenuItem['category'])[] = ['Semua', 'Hidangan Pembuka', 'Hidangan Utama', 'Hidangan Penutup', 'Minuman'];

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const fetchedItems = await fetchMenuItems();
      setItems(fetchedItems);
      setLoading(false);
    };
    loadMenu();
  }, []);
  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, searchTerm, selectedCategory]);

  return (
    <div className="bg-brand-background py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Menu Kami"
          subtitle="Pilihan hidangan terbaik kami, dibuat dengan bahan-bahan segar."
        />

        <div className="sticky top-20 z-40 bg-brand-background/90 backdrop-blur-xl py-4 mb-12 -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                <div className="max-w-xl mx-auto">
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Cari hidangan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                      />
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                </div>
                <ScrollableTabs
                    id="category-filter"
                    options={categories}
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val as 'Semua' | MenuItem['category'])}
                />
            </div>
        </div>

        {loading 
          ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <MenuCardSkeleton key={index} />
                ))}
              </div>
            )
          : filteredItems.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                {filteredItems.map((item, index) => (
                  <Link 
                    key={item.id} 
                    to={`/menu/${item.id}`} 
                    className="block opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <MenuCard 
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      image={item.image}
                      badge={item.badge}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-bold text-brand-dark">Hidangan Tidak Ditemukan</h3>
                <p className="text-brand-secondary mt-2">Coba sesuaikan kriteria pencarian atau filter Anda.</p>
              </div>
            )
        }
      </div>
    </div>
  );
};

export default Menu;
