import { parseOffProduct } from '@/utils/openFoodFacts';

jest.mock('expo-constants', () => ({ expoConfig: { version: '1.0.0' } }));

describe('parseOffProduct', () => {
  const response = {
    status: 1,
    product: {
      product_name: 'Nutella',
      product_name_es: 'Crema de avellanas',
      brands: 'Ferrero, Nutella',
      serving_quantity: '15',
      nutriments: {
        'energy-kcal_100g': 539,
        proteins_100g: 6.3,
        carbohydrates_100g: 57.5,
        fat_100g: 30.9,
      },
    },
  };

  it('reads macros per 100 g, the serving size and a localized name with the brand', () => {
    expect(parseOffProduct('3017620422003', response, 'es')).toEqual({
      barcode: '3017620422003',
      name: 'Crema de avellanas (Ferrero)',
      per100g: { calories: 539, protein: 6.3, carbs: 57.5, fat: 30.9 },
      servingGrams: 15,
    });
  });

  it('falls back to the main name and converts kJ when kcal is missing', () => {
    const food = parseOffProduct(
      '123',
      { status: 1, product: { product_name: 'Ferrero Rocher', brands: 'Ferrero', nutriments: { energy_100g: 2259, fat_100g: 42 } } },
      'en',
    );
    expect(food?.name).toBe('Ferrero Rocher');
    expect(food?.per100g.calories).toBe(540);
    expect(food?.servingGrams).toBeUndefined();
  });

  it('returns null when the product is missing or has no nutrition data', () => {
    expect(parseOffProduct('1', { status: 0 }, 'en')).toBeNull();
    expect(parseOffProduct('1', { status: 1, product: { product_name: 'Water', nutriments: {} } }, 'en')).toBeNull();
  });
});
