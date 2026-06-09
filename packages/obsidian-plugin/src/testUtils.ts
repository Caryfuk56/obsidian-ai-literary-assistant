/**
 * Throws when a test condition is not met.
 */
export const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

/**
 * Throws when two values are not strictly equal.
 */
export const assertEqual = <T>(actual: T, expected: T, message: string): void => {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${String(expected)}, got ${String(actual)}.`);
  }
};
