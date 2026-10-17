// a receiver-bearing default ONE LEVEL IN belongs to the default, not to the outer host - the
// host only decides where the residual lives
export const c1 = (() => { const { inner: { at } = [1, 2] } = {}; return typeof at; })();
export const r = [c1];
