let n;
export const unguardedWindowValue = (n = globalThis.window).self.Array.prototype.flat.call([1, [2]]);
