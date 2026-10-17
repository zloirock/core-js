const f = () => globalThis;
const { iterator } = (f()).self.Symbol;
export const q = typeof iterator;
