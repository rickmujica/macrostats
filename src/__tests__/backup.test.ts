import { getWeights, logWeight } from '@/storage/body';
import { addMeal, getMeals } from '@/storage/meals';
import { createBackup, InvalidBackupError, parseBackup, restoreBackup } from '@/utils/backup';
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('backups', () => {
  it('round-trips meals and weights through a file', async () => {
    await addMeal({ name: 'Eggs', calories: 140, protein: 12, carbs: 1, fat: 10 });
    await logWeight(new Date(2026, 9, 16), 80.4);
    const text = JSON.stringify(await createBackup(new Date(2026, 9, 16)));

    await AsyncStorage.clear();
    await restoreBackup(parseBackup(text));

    expect((await getMeals()).map((meal) => meal.name)).toEqual(['Eggs']);
    expect(await getWeights()).toEqual([{ date: '2026-10-16', kg: 80.4 }]);
  });

  it('clears data the backup does not have', async () => {
    const empty = await createBackup();
    await addMeal({ name: 'Eggs', calories: 140, protein: 12, carbs: 1, fat: 10 });
    await restoreBackup(empty);
    expect(await getMeals()).toEqual([]);
  });

  it('rejects files that are not MacroZone backups', () => {
    expect(() => parseBackup('not json')).toThrow(InvalidBackupError);
    expect(() => parseBackup('{"app":"Other","format":1,"data":{}}')).toThrow(InvalidBackupError);
    expect(() => parseBackup('{"app":"MacroZone","format":99,"data":{}}')).toThrow(InvalidBackupError);
    expect(() => parseBackup('{"app":"MacroZone","format":1,"data":{"meals":{}}}')).toThrow(InvalidBackupError);
  });
});
