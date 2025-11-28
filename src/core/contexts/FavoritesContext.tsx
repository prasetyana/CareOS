import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchUserFavoriteIds, addUserFavorite, removeUserFavorite } from '../data/mockDB';
import { useToast } from '../hooks/useToast';

interface FavoritesContextType {
    favorites: number[];
    isFavorite: (menuItemId: number) => boolean;
    toggleFavorite: (menuItemId: number) => Promise<void>;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [favorites, setFavorites] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadFavorites(user.id);
        } else {
            setFavorites([]);
        }
    }, [user]);

    const loadFavorites = async (userId: number) => {
        setLoading(true);
        try {
            const ids = await fetchUserFavoriteIds(userId);
            setFavorites(ids);
        } catch (error) {
            console.error('Failed to load favorites', error);
        } finally {
            setLoading(false);
        }
    };

    const isFavorite = (menuItemId: number) => {
        return favorites.includes(menuItemId);
    };

    const toggleFavorite = async (menuItemId: number) => {
        if (!user) {
            addToast('Silakan login untuk menyimpan favorit', 'error');
            return;
        }

        const isCurrentlyFavorite = isFavorite(menuItemId);

        // Optimistic update
        setFavorites(prev =>
            isCurrentlyFavorite
                ? prev.filter(id => id !== menuItemId)
                : [...prev, menuItemId]
        );

        try {
            if (isCurrentlyFavorite) {
                await removeUserFavorite(user.id, menuItemId);
                addToast('Dihapus dari favorit', 'success');
            } else {
                await addUserFavorite(user.id, menuItemId);
                addToast('Ditambahkan ke favorit', 'success');
            }
        } catch (error) {
            // Revert on error
            setFavorites(prev =>
                isCurrentlyFavorite
                    ? [...prev, menuItemId]
                    : prev.filter(id => id !== menuItemId)
            );
            addToast('Gagal memperbarui favorit', 'error');
            console.error('Failed to toggle favorite', error);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
