import { dateKey } from '@/utils/dates';
import { roundAmount } from '@/utils/numbers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeightEntry = {
  /** Local day, YYYY-MM-DD. */
  date: string;
  kg: number;
};

export const WEIGHTS_KEY = 'weights';
export const WATER_KEY = 'water';

/** One glass, the step for the water buttons. */
export const GLASS_ML = 250;

/** All weight entries, oldest first. */
export const getWeights = async (): Promise<WeightEntry[]> => {
  const stored = await AsyncStorage.getItem(WEIGHTS_KEY);
  const entries = stored ? (JSON.parse(stored) as WeightEntry[]) : [];
  return entries.sort((a, b) => a.date.localeCompare(b.date));
};

/** Saves the weight for a day, replacing any earlier entry for the same day. */
export const logWeight = async (date: Date, kg: number): Promise<WeightEntry[]> => {
  const key = dateKey(date);
  const entries = (await getWeights()).filter((entry) => entry.date !== key);
  const next = [...entries, { date: key, kg: roundAmount(kg) }].sort((a, b) => a.date.localeCompare(b.date));
  await AsyncStorage.setItem(WEIGHTS_KEY, JSON.stringify(next));
  return next;
};

export const deleteWeight = async (date: Date): Promise<void> => {
  const key = dateKey(date);
  const entries = await getWeights();
  await AsyncStorage.setItem(WEIGHTS_KEY, JSON.stringify(entries.filter((entry) => entry.date !== key)));
};

/** Weight change between the latest entry and the last entry on or before `days` days earlier. */
export const getWeightChange = (entries: WeightEntry[], days: number): number | null => {
  if (entries.length < 2) {
    return null;
  }
  const latest = entries[entries.length - 1];
  const since = new Date(`${latest.date}T00:00:00`);
  since.setDate(since.getDate() - days);
  const sinceKey = dateKey(since);
  const baseline = [...entries].reverse().find((entry) => entry.date <= sinceKey) ?? entries[0];
  if (baseline.date === latest.date) {
    return null;
  }
  return roundAmount(latest.kg - baseline.kg);
};

const getWaterLog = async (): Promise<Record<string, number>> => {
  const stored = await AsyncStorage.getItem(WATER_KEY);
  return stored ? (JSON.parse(stored) as Record<string, number>) : {};
};

export const getWater = async (date: Date): Promise<number> => {
  const log = await getWaterLog();
  return log[dateKey(date)] ?? 0;
};

/** Adds (or with a negative amount, removes) water for a day. Returns the new total in ml. */
export const addWater = async (date: Date, ml: number): Promise<number> => {
  const log = await getWaterLog();
  const key = dateKey(date);
  const total = Math.max(0, (log[key] ?? 0) + ml);
  if (total === 0) {
    delete log[key];
  } else {
    log[key] = total;
  }
  await AsyncStorage.setItem(WATER_KEY, JSON.stringify(log));
  return total;
};
