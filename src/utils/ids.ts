/** A short id that stays unique when several records are created in the same millisecond. */
export const createId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
