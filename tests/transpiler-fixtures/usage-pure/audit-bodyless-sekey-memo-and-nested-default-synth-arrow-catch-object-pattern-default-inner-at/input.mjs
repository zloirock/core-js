export const c5 = (() => { try { throw {}; } catch ({ inner: { at } = [1, 2] }) { return typeof at; } })();
export const r = [c5];
