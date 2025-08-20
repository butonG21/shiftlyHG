// Storage keys constants
export const STORAGE_KEYS = {
  TOKEN: 'token',
  LOGIN_TIME: 'loginTime',
  USER_PROFILE: 'userProfile',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];