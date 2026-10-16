import type { MacroTotals } from '@/storage/meals';
import { createId } from '@/utils/ids';
import type { Portion } from '@/utils/portions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

export type FavoriteFood = MacroTotals & {
  id: string;
  name: string;
  portion?: Portion;
};

export const FAVORITES_KEY = 'favorites';

const nameKey = (name: string) => name.trim().toLowerCase();

let cache: FavoriteFood[] | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export const getFavorites = async (): Promise<FavoriteFood[]> => {
  if (cache) {
    return cache;
  }
  const stored = await AsyncStorage.getItem(FAVORITES_KEY);
  cache = stored ? (JSON.parse(stored) as FavoriteFood[]) : [];
  return cache;
};

const saveFavorites = async (favorites: FavoriteFood[]) => {
  cache = favorites;
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  emit();
};

/** Adds the food to favorites, or removes it if a favorite with that name exists. Returns whether it is now a favorite. */
export const toggleFavorite = async (
  food: Omit<FavoriteFood, 'id'>,
): Promise<boolean> => {
  const favorites = await getFavorites();
  const key = nameKey(food.name);
  if (favorites.some((favorite) => nameKey(favorite.name) === key)) {
    await saveFavorites(favorites.filter((favorite) => nameKey(favorite.name) !== key));
    return false;
  }

  const { name, calories, protein, carbs, fat, portion } = food;
  await saveFavorites([{ id: createId(), name: name.trim(), calories, protein, carbs, fat, portion }, ...favorites]);
  return true;
};

export const removeFavorite = async (id: string): Promise<void> => {
  const favorites = await getFavorites();
  await saveFavorites(favorites.filter((favorite) => favorite.id !== id));
};

/** Forgets the in-memory copy, e.g. after a backup is restored. */
export const resetFavoritesCache = () => {
  cache = null;
  getFavorites().then(emit);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const EMPTY: FavoriteFood[] = [];

/** Favorites that stay in sync across screens. */
export const useFavorites = () => {
  const favorites = useSyncExternalStore(subscribe, () => cache ?? EMPTY, () => EMPTY);

  useEffect(() => {
    if (!cache) {
      getFavorites().then(emit);
    }
  }, []);

  return {
    favorites,
    isFavorite: (name: string) => favorites.some((favorite) => nameKey(favorite.name) === nameKey(name)),
  };
};
