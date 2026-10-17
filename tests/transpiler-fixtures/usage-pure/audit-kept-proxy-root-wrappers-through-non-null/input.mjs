let b;
export const throughNonNull = (b = globalThis.window)!?.self.Array.prototype.at.call([1], 0);
