/**
 * Global storage API declarations
 *
 * Provides type definitions for platform-specific storage APIs:
 * - AsyncStorage: React Native storage
 * - localStorage: Web browser storage
 */

declare global {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  } | undefined;

  const localStorage: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  } | undefined;
}

export {};
