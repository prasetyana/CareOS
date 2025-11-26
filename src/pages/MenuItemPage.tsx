

import React, { useState, useEffect } from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { useParams, Link } from "react-router-dom";
import { MenuItem, fetchMenuItemById } from '../data/mockDB';
import SkeletonLoader from '../components/SkeletonLoader';
import { ArrowLeft } from 'lucide-react';

const MenuItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItem = async () => {
      if (id) {
        setLoading(true);
        const fetchedItem = await fetchMenuItemById(Number(id));
        setItem(fetchedItem || null);
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-brand-background py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <SkeletonLoader className="w-full h-96 rounded-2xl" />
            <div className="space-y-6">
              <SkeletonLoader className="w-3/4 h-12 rounded-lg" />
              <SkeletonLoader className="w-full h-24 rounded-lg" />
              <SkeletonLoader className="w-1/4 h-10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
        <div className="bg-brand-background py-20 text-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-brand-dark">Item Menu Tidak Ditemukan</h1>
                <p className="text-brand-secondary mt-4">Maaf, kami tidak dapat menemukan hidangan yang Anda cari.</p>
                <Link to="/menu" className="mt-8 inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-red-700 transition duration-300">
                    Kembali ke Menu
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-brand-background py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-8">
            <Link to="/menu" className="text-brand-primary hover:underline font-medium inline-flex items-center">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali ke Menu
            </Link>
        </div>
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <img src={item.image} alt={item.name} className="w-full h-auto object-cover rounded-2xl shadow-lg" />
            <div className="space-y-6">
              <h1 className="text-5xl font-bold font-sans text-brand-dark">{item.name}</h1>
              <p className="text-lg text-brand-secondary leading-relaxed">{item.description}</p>
              <p className="text-4xl font-bold text-brand-primary">{item.price}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemPage;
