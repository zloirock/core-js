let b;
// NEGATIVE: a kept write under the `?.` - the guard tests the write, no seal to preserve
export const keptWriteRoot = (b = globalThis.window)?.self.Array.of(5);
