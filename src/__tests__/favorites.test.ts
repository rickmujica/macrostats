import { getFavorites, removeFavorite, toggleFavorite } from '@/storage/favorites';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('favorites', () => {
  it('toggles a food by name, ignoring case and spaces', async () => {
    await AsyncStorage.clear();
    const eggs = { name: 'Eggs', calories: 140, protein: 12, carbs: 1, fat: 10 };
    expect(await toggleFavorite(eggs)).toBe(true);
    expect((await getFavorites()).map((f) => f.name)).toEqual(['Eggs']);
    expect(await toggleFavorite({ ...eggs, name: ' eggs ' })).toBe(false);
    expect(await getFavorites()).toEqual([]);

    await toggleFavorite(eggs);
    const [favorite] = await getFavorites();
    await removeFavorite(favorite.id);
    expect(await getFavorites()).toEqual([]);
  });
});
