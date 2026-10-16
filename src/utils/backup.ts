import { WATER_KEY, WEIGHTS_KEY } from '@/storage/body';
import { FAVORITES_KEY } from '@/storage/favorites';
import { MEALS_KEY } from '@/storage/meals';
import { APP_SETTINGS_KEY } from '@/storage/settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Everything a backup carries. Keys are AsyncStorage keys. */
const BACKUP_KEYS = [MEALS_KEY, APP_SETTINGS_KEY, FAVORITES_KEY, WEIGHTS_KEY, WATER_KEY];

const BACKUP_APP = 'MacroStats';
const BACKUP_FORMAT = 1;

export type Backup = {
  app: typeof BACKUP_APP;
  format: number;
  exportedAt: string;
  data: Record<string, unknown>;
};

export class InvalidBackupError extends Error {}

export const createBackup = async (now = new Date()): Promise<Backup> => {
  const entries = await AsyncStorage.multiGet(BACKUP_KEYS);
  const data: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (value !== null) {
      data[key] = JSON.parse(value);
    }
  }
  return { app: BACKUP_APP, format: BACKUP_FORMAT, exportedAt: now.toISOString(), data };
};

/** Checks a backup file's text and returns it parsed, or throws InvalidBackupError. */
export const parseBackup = (text: string): Backup => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new InvalidBackupError('not JSON');
  }

  const backup = parsed as Partial<Backup>;
  if (
    !backup ||
    backup.app !== BACKUP_APP ||
    typeof backup.format !== 'number' ||
    backup.format > BACKUP_FORMAT ||
    typeof backup.data !== 'object' ||
    backup.data === null
  ) {
    throw new InvalidBackupError('not a MacroStats backup');
  }
  if (backup.data[MEALS_KEY] !== undefined && !Array.isArray(backup.data[MEALS_KEY])) {
    throw new InvalidBackupError('meals is not a list');
  }
  return backup as Backup;
};

/** Replaces the app's data with the backup's. Keys missing from the backup are cleared. */
export const restoreBackup = async (backup: Backup): Promise<void> => {
  const present = BACKUP_KEYS.filter((key) => backup.data[key] !== undefined);
  const missing = BACKUP_KEYS.filter((key) => backup.data[key] === undefined);
  await AsyncStorage.multiSet(present.map((key) => [key, JSON.stringify(backup.data[key])]));
  if (missing.length > 0) {
    await AsyncStorage.multiRemove(missing);
  }
};
