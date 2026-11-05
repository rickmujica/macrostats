import { macrosForGrams } from '@/utils/portions';

describe('macrosForGrams', () => {
  const oats = { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 };

  it('scales macros per 100 g to the amount eaten', () => {
    expect(macrosForGrams(oats, 40)).toEqual({ calories: 156, protein: 6.8, carbs: 26.5, fat: 2.8 });
  });

  it('returns the per-100 g values for 100 g and zeros for 0 g', () => {
    expect(macrosForGrams(oats, 100)).toEqual(oats);
    expect(macrosForGrams(oats, 0)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});
