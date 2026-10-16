import { calculateGoals, type UserProfile } from '@/storage/settings';

const profile: UserProfile = {
  age: 30,
  height: 180,
  weight: 80,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
};

describe('calculateGoals', () => {
  it('uses Mifflin-St Jeor with the activity factor', () => {
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 1780; x1.45 = 2581.
    const goals = calculateGoals(profile);
    expect(goals.calories).toBe(2581);
    expect(goals.protein).toBe(144);
    expect(goals.fat).toBe(Math.round((2581 * 0.25) / 9));
  });

  it('keeps calories, protein, carbs and fat consistent', () => {
    const goals = calculateGoals(profile);
    const fromMacros = goals.protein * 4 + goals.carbs * 4 + goals.fat * 9;
    expect(Math.abs(fromMacros - goals.calories)).toBeLessThanOrEqual(6);
  });

  it('adjusts calories for the goal, with a 1200 kcal floor', () => {
    const maintain = calculateGoals(profile).calories;
    expect(calculateGoals({ ...profile, goal: 'lose' }).calories).toBe(maintain - 350);
    expect(calculateGoals({ ...profile, goal: 'gain' }).calories).toBe(maintain + 350);

    const small: UserProfile = { ...profile, weight: 40, height: 140, age: 80, gender: 'female', activityLevel: 'low', goal: 'lose' };
    expect(calculateGoals(small).calories).toBe(1200);
  });

  it('uses the female formula', () => {
    // BMR = 10*60 + 6.25*165 - 5*30 - 161 = 1320.25; x1.2 = 1584.
    expect(calculateGoals({ ...profile, weight: 60, height: 165, gender: 'female', activityLevel: 'low' }).calories).toBe(1584);
  });
});
