export const startOfDay = (date: Date): Date => {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

export const addDays = (date: Date, days: number): Date => {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
};

/** The seven days of the week containing `date`. Spanish weeks start on Monday, English on Sunday. */
export const getWeekDays = (date: Date, locale: string): Date[] => {
  const weekStartsOn = locale.startsWith('es') ? 1 : 0;
  const day = startOfDay(date);
  const offset = (day.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(day, -offset);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
};
