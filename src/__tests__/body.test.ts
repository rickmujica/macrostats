import { addWater, getWater, getWeightChange, getWeights, logWeight } from '@/storage/body';
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('weights', () => {
  it('keeps one entry per day, sorted by date', async () => {
    await logWeight(new Date(2026, 9, 16, 8), 80);
    await logWeight(new Date(2026, 9, 10), 81.2);
    await logWeight(new Date(2026, 9, 16, 21), 79.6);
    expect(await getWeights()).toEqual([
      { date: '2026-10-10', kg: 81.2 },
      { date: '2026-10-16', kg: 79.6 },
    ]);
  });

  it('measures change against the last entry before the period', () => {
    const entries = [
      { date: '2026-09-01', kg: 84 },
      { date: '2026-09-15', kg: 82 },
      { date: '2026-10-09', kg: 81 },
      { date: '2026-10-12', kg: 80.8 },
      { date: '2026-10-16', kg: 80.5 },
    ];
    // 30 days back is Sep 16: the last weight known then is Sep 15's.
    expect(getWeightChange(entries, 30)).toBe(-1.5);
    // 7 days back is Oct 9.
    expect(getWeightChange(entries, 7)).toBe(-0.5);
    expect(getWeightChange([{ date: '2026-10-16', kg: 80 }], 30)).toBeNull();
  });
});

describe('water', () => {
  it('adds and removes water per day without going below zero', async () => {
    const day = new Date(2026, 9, 16);
    expect(await addWater(day, 250)).toBe(250);
    expect(await addWater(day, 250)).toBe(500);
    expect(await addWater(day, -750)).toBe(0);
    expect(await getWater(day)).toBe(0);
    expect(await getWater(new Date(2026, 9, 15))).toBe(0);
  });
});
