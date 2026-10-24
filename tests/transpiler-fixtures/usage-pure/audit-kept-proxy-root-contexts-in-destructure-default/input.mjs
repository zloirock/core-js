let p;
export const inDestructureDefault = (({ x = (p = globalThis.window)?.self.Array.prototype.includes } = {}) => x)();
