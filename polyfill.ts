
// Polyfill for Array.prototype.at

// Global declaration for Array.prototype.at
// This ensures TypeScript recognizes the 'at' method on arrays globally.
declare global {
  interface Array<T> {
    at(index: number): T | undefined;
  }
}

if (!Array.prototype.at) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.at = function <T>(this: T[], index: number): T | undefined {
    const len = this.length;
    let k = index; // Keep original index for calculations
    if (k < 0) {
      k += len;
    }
    if (k < 0 || k >= len) {
      return undefined;
    }
    return this[k];
  };
}

export {};
