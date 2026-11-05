import { addDays, getWeekDays, startOfDay } from '@/utils/dates';

describe('dates', () => {
  it('startOfDay drops the time', () => {
    const day = startOfDay(new Date(2026, 9, 16, 18, 45));
    expect(day).toEqual(new Date(2026, 9, 16));
  });

  it('addDays crosses month boundaries', () => {
    expect(addDays(new Date(2026, 9, 31), 1)).toEqual(new Date(2026, 10, 1));
    expect(addDays(new Date(2026, 0, 1), -1)).toEqual(new Date(2025, 11, 31));
  });

  it('starts Spanish weeks on Monday and English weeks on Sunday', () => {
    // Friday, October 16, 2026.
    const friday = new Date(2026, 9, 16, 12);
    expect(getWeekDays(friday, 'es')[0]).toEqual(new Date(2026, 9, 12));
    expect(getWeekDays(friday, 'en')[0]).toEqual(new Date(2026, 9, 11));
    expect(getWeekDays(friday, 'es')).toHaveLength(7);
  });
});
